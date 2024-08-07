/*
 * Author: Augustin Laouar
 * Project Repository: https://github.com/augustin-laouar/Jack
 * License: GNU General Public License v3.0
 * 
 * This project is licensed under the GNU General Public License v3.0.
 * You may obtain a copy of the License at
 * 
 *     https://www.gnu.org/licenses/gpl-3.0.en.html
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as storage from '../../tools/storage.js';
import * as error from '../../exception/error.js';
import * as crypto from '../../tools/crypto.js';
import { setDerivedKey, getDerivedKey } from '../vars.js';

async function read_json_file(jsonfile) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsText(jsonfile);
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                resolve(jsonData);
            } catch (e) {
                reject(new error.Error('Error reading account file.', true));
            }
        };
        reader.onerror = function() {
            reject(new error.Error('Account file is unreadable.', true));
        };
    });
}

async function import_account(jsonfile, password, keepCurrPsw) {
    let json;
    try {
        json = await read_json_file(jsonfile);
    }
    catch(e) {
        throw new error.Error('Unreadable file.', true);
    }
    //Check if these required values exists
    if (!(json.metadata && json.metadata.version && json.masterPswHash)) {
        throw new error.Error('File is corrupted.', true);
    }
    const version = json.metadata.version;
    if(version !== 1) { // If, in a future version of Jack's Mails, the file account won't be the same 
        throw new error.Error("This file version is not supported. Please udpate Jack's Mails to import this account.", true);
    }
    const masterPswHash = json.masterPswHash;
    const connectionDuration = json.connectionDuration ?? 3; // 3 mins is default value
    const emails = json.emails ?? []; //Empty list by default
    const creds = json.credentials ?? [];
    const generators = json.generators ?? [];

    if(!(await crypto.isValidHash(password, masterPswHash))) {
        throw new error.Error('Invalid password. Unable to decrypt the file.', true);
    }

    if(keepCurrPsw) {
        try {
            //create other key
            const fileKey = await crypto.generateDerivedKey(password);
            const currentKey = getDerivedKey();
            var newEmails = [];
            var newCreds = [];
            for(const element of emails) {
                const email = await crypto.decryptWithAES(element.email, fileKey);
                const newEncryption = await crypto.encryptWithAES(email, currentKey);
                const newElement = {
                    id: element.id,
                    email: newEncryption
                };
                newEmails.push(newElement);
            }
            for(const element of creds) {
                const content = await crypto.decryptWithAES(element.content, fileKey);
                const newEncryption = await crypto.encryptWithAES(content, currentKey);

                const newElement = {
                    id: element.id,
                    content: newEncryption
                };
                newCreds.push(newElement);
            }
        }
        catch(e) {
            throw new error.Error('Unable to decrypt account file. It may be corrupted.', true);
        }
        await storage.store({ connectionDuration: connectionDuration});
        await storage.store({ emails: newEmails });
        await storage.store({ credentials: newCreds });
        await storage.store({ generators: generators});
    }
    else {
        await storage.store({ masterPswHash: masterPswHash});
        await storage.store({ connectionDuration: connectionDuration});
        await storage.store({ emails: emails});
        await storage.store({ logs: creds });
        await storage.store({ psw_generators: generators});
        const newKey = await crypto.generateDerivedKey(password);
        setDerivedKey(newKey);
    }
}


export async function handle(message) {
    await import_account(message.params.jsonFile, message.params.password, message.params.keepCurrPsw);
    return true;
}