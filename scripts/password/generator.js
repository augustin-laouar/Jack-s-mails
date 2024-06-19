import * as random from '../tools/rand_char.js';
import * as storage from '../tools/storage.js';
import * as error from '../exception/error.js';

export const default_generator_id = '6675636b75';

export async function storeDefaultGenerator() {
    try {
        const char_params ={
            lowercase: true,
            uppercase: true, 
            numbers: true, 
            specials: true,
            excluded_chars: ''
        };
        
        await addGenerator('Default generator', 12, char_params, default_generator_id);
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

function getCharList(lowercase, uppercase, numbers, specials, excluded_chars) {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_-+=[]{}|:;"<>,.?/~`';
    
    let charList = '';
    
    if (lowercase) {
        charList += lowercaseChars;
    }
    if (uppercase) {
        charList += uppercaseChars;
    }
    if (numbers) {
        charList += numberChars;
    }
    if (specials) {
        charList += specialChars;
    }
    
    const filteredCharList = charList.split('').filter(char => !excluded_chars.includes(char)).join('');
    
    if(filteredCharList.length === 0 ){
        throw new error.Error('All characters are excluded.', true);
    }
    return filteredCharList;
}

export async function addGenerator(name, length, char_params, id = null) {
    var generators;
    try {
        generators = await getGenerators();
    }
    catch (e) {
        throw error.castError(e, false);
    }
    if(generators.some(gen => gen.name === name)) {
        throw new error.Error('A password generator with the same name exists.', true);
    }
    try {
        if(!id){
            id = random.generateAlphaNumeric(10);
            while(generators.some(gen => gen.id === id)) {
                id = random.generateAlphaNumeric(10);
            }
        }
        const char_list = getCharList(
            char_params.lowercase,
            char_params.uppercase, 
            char_params.numbers, 
            char_params.specials,
            char_params.excluded_chars
        );
        var generator = {
            id: id,
            name: name,
            psw_length: length,
            char_params: char_params,
            char_list: char_list
        }
        generators.push(generator);
        await storeGenerators(generators);
    }
    catch(e) {
        throw error.castError(e, false);
    }
}

export async function getGenerator(id) {
    try{
        const generators = await getGenerators();
        for(const generator of generators) {
          if(generator.id === id){
            return generator;
          }
        }
        return null;
      }
      catch(e) {
        throw error.castError(e, false);
      }
}

export async function deleteGenerator(id) {
    try {
        var generators = await getGenerators();
        if(generators === null) {
          return;
        }
    
        var updatedGenerators = generators.filter(generator => generator.id !== id);
        await storeGenerators(updatedGenerators);
      }
      catch(e) {
        throw error.castError(e, false);
      }
}

export async function updateGenerator(id, name, length, char_params) {
    var generators;
    var current_name;
    try {
        generators = await getGenerators();
        const current_generator = await getGenerator(id);
        current_name = current_generator.name;
    }
    catch (e) {
        throw error.castError(e, false);
    }
    if(name !== current_name) { //if name changed we check if there is already a generator with this name
        if(generators.some(gen => gen.name === name)) {
            throw new error.Error('A password generator with the same name exists.', true);
        }
    }
    try{
        var updatedGenerators = generators.filter(generator => generator.id !== id);
        const char_list = getCharList(
            char_params.lowercase,
            char_params.uppercase, 
            char_params.numbers, 
            char_params.specials,
            char_params.excluded_chars
        );
        var newGenerator = {
            id: id,
            name: name,
            psw_length: length,
            char_params: char_params,
            char_list: char_list
        }
        updatedGenerators.push(newGenerator);
        await storeGenerators(updatedGenerators);
    }
    catch(e) {
        throw error.castError(e, false);
    }

}



export async function storeGenerators(generators) { //sort list before storing
    generators.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));    
    const defaultIndex = generators.findIndex(generator => generator.id === default_generator_id);
    if (defaultIndex !== -1) {
        const [defaultGenerator] = generators.splice(defaultIndex, 1);
        generators.unshift(defaultGenerator);
    }
    await storage.store({ psw_generators: generators });
}

export async function getGenerators() {
    try {
        const generators = await storage.read('psw_generators');
        if(generators === null) {
            return [];
        }
        else if(generators.length === 0){
            return [];
        }
        return generators;
      }
      catch(e) {
        throw error.castError(e, false);
      }
}


export async function getRandomPassword(generator_id) { 
    const generator = await getGenerator(generator_id);
    return random.generate(generator.psw_length, generator.char_list);
}