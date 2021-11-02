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

const setDiffDiv = (outputElement, outputHeader, firstFile, firstFileName, secondFile, secondFileName) => {
    if (firstFile === null || secondFile === null) {
        return;
    }
    outputHeader.innerHTML = `from language <b>${firstFileName.split('.')[0]}</b> to language <b>${secondFileName.split('.')[0]}</b>`;
    outputElement.innerHTML = JSON.stringify(diff(firstFile, secondFile), null, 2);
}

class DebouncedListener {
    timer;
    callback;
    delay;
    constructor(delay, callback) {
        this.callback = callback;
        this.delay = delay;
    }
    invoke(ev) {
        if (!!this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = setTimeout(() => {
            if (!!this.callback && (typeof this.callback === 'function')) {
                this.callback(ev);
            }
        }, this.delay)
    }
}

const addDebouncedEventListener = (element, events, delay, callback) => {
    if (!!element && !!events && events.length) {
        for (const event of events) {
            const listener = new DebouncedListener(delay, callback);
            element.addEventListener(event, (ev) => listener.invoke(ev));
        }
    }
}

const loadPage = () => {

    let firstFile = null, secondFile = null;
    const firstFileElement = document.getElementById('firstFile');
    const firstFileButton = document.getElementById('firstFileButton');

    let firstFileName = null, secondFileName = null;
    const secondFileElement = document.getElementById('secondFile');
    const secondFileButton = document.getElementById('secondFileButton');

    const outputWrapper = document.getElementById('outputWrapper');
    const outputHeader = document.getElementById('outputHeader');
    const outputElement = document.getElementById('output');
    const downloadElement = document.getElementById('download');
    const downloadLink = document.createElement('a');

    // outputWrapper.hidden = true;

    firstFileButton.addEventListener('click', () => {
        firstFileElement.click();
    })

    secondFileButton.addEventListener('click', () => {
        secondFileElement.click();
    })

    addDebouncedEventListener(outputElement, ['keydown'], 400, () => {
        const selectedText = window.getSelection();
        const style = selectedText.anchorNode.parentElement.style;
        if (style.color === 'red') {
            style.color = 'green';
        }
    })

    firstFileElement.addEventListener('change', (ev) => readFile(ev, (json, fileName) => {
        firstFile = JSON.parse(json);
        firstFileName = fileName;
        setDiffDiv(outputElement, outputHeader, firstFile, firstFileName, secondFile, secondFileName);
        if (firstFile && secondFile) {
            outputWrapper.hidden = false;
        }
    }), false);

    secondFileElement.addEventListener('change', (ev) => readFile(ev, (json, fileName) => {
        secondFile = JSON.parse(json);
        secondFileName = fileName;
        setDiffDiv(outputElement, outputHeader, firstFile, firstFileName, secondFile, secondFileName);
        if (firstFile && secondFile) {
            outputWrapper.hidden = false;
        }
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
