// import en from './i18n/en.js'
// import he from './i18n/he.js'
// import ar from './i18n/ar.js'

const colorStrings = (obj, color) => {
    if (typeof obj !== 'object') {
        return `<span style=color:${color}>` + obj + '</span>';
    }

    const keys = Object.keys(obj);
    for (let key of keys) {
        obj[key] = colorStrings(obj[key], color);
    }
    return obj;
}

const diff = (obj1, obj2) => {
    const result = {};
    if (Object.is(obj1, obj2)) {
        return undefined;
    }
    if (!obj2 || typeof obj2 !== 'object') {
        return obj2;
    }
    Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
        if (obj1[key] !== null && obj2[key] == null) {
            result[key] = colorStrings(obj1[key], 'red');
        }
        else if(typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
            const value = diff(obj1[key], obj2[key]);
            if (value !== undefined) {
                result[key] = colorStrings(value, 'green');
            }
        } else {
            result[key] = obj2[key];
        }
    });
    return result;
}
 
const readFile = (evt, callback) => {
    var files = evt.target.files;
    var file = files[0];           
    var reader = new FileReader();
    reader.onload = function(event) {
      callback(event.target.result, file.name);
    }
    reader.readAsText(file)
}

const setDiffDiv = (outputElement, firstFile, secondFile) => {
    if (firstFile === null || secondFile === null) {
        return;
    }
    outputElement.innerHTML = JSON.stringify(diff(firstFile, secondFile), null, 2);
}

const loadPage = () => {
    let firstFile = null, secondFile = null;
    let firstFileName = null, secondFileName = null;

    const firstFileElement = document.getElementById('firstFile');
    const secondFileElement = document.getElementById('secondFile');
    const outputElement = document.getElementById('output');
    const downloadElement = document.getElementById('download');
    const downloadLink = document.createElement('a');
    
    firstFileElement.addEventListener('change', (ev) => readFile(ev, (json, fileName) => {
        firstFile = JSON.parse(json);
        firstFileName = fileName;
        setDiffDiv(outputElement, firstFile, secondFile);
    }), false);

    secondFileElement.addEventListener('change', (ev) => readFile(ev, (json, fileName) => {
        secondFile = JSON.parse(json);
        secondFileName = fileName;
        setDiffDiv(outputElement, firstFile, secondFile);
    }), false);

    downloadElement.addEventListener('click', async() => {
        const blob = new Blob([outputElement.innerText], { type: 'text/plain' });
        const fileName = secondFileName;
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.download = fileName;
        downloadLink.click();
    })
    document.getElementById('copy').addEventListener('click', async () => {
        await navigator.clipboard.writeText(outputElement.innerText);
        alert('copied !');
    }, false);
}

loadPage();
