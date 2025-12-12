// ========== CONFIGURAZIONE FIREBASE ==========
const firebaseConfig = {
  apiKey: "AIzaSyCJ-k4qQnokmNbzBGB4QqFaZ4zRcGe24",
  authDomain: "amantisegreti.firebaseapp.com",
  databaseURL: "https://amantisegreti-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "amantisegreti",
  storageBucket: "amantisegreti.firebasestorage.app",
  messagingSenderId: "979636521068",
  appId: "1:979636521068:web:026891d053a9348163b049",
  measurementId: "G-QH3BHB1VE8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ========== 0. GESTIONE SESSION (localStorage) ==========
let userNumber = null;
let currentSession = null;

function checkSessionAndInit() {
  const savedSession = localStorage.getItem('amanti_segreti_session');
  const savedUserNumber = localStorage.getItem('amanti_segreti_number');
  
  if (savedSession === 'active' && savedUserNumber) {
    userNumber = savedUserNumber;
    currentSession = {
      userNumber: savedUserNumber,
      birthDate: localStorage.getItem('amanti_segreti_birthDate'),
      age: parseInt(localStorage.getItem('amanti_segreti_age')),
      sign: localStorage.getItem('amanti_segreti_sign')
    };
    
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    userNumberLabel.textContent = `Questa sera sei il numero ${userNumber}`;
    if (logoNumberEl) logoNumberEl.textContent = userNumber;
    
    daySelect.disabled = true;
    monthSelect.disabled = true;
    yearSelect.disabled = true;
    btnEnter.disabled = true;
    
    return true;
  }
  
  return false;
}

function startNewSession(number, day, month, year, age, sign) {
  localStorage.setItem('amanti_segreti_session', 'active');
  localStorage.setItem('amanti_segreti_number', number);
  localStorage.setItem('amanti_segreti_birthDate', `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  localStorage.setItem('amanti_segreti_age', age);
  localStorage.setItem('amanti_segreti_sign', sign);
  
  userNumber = number;
  currentSession = {
    userNumber: number,
    birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    age: age,
    sign: sign
  };
}

function clearSession() {
  localStorage.removeItem('amanti_segreti_session');
  localStorage.removeItem('amanti_segreti_number');
  localStorage.removeItem('amanti_segreti_birthDate');
  localStorage.removeItem('amanti_segreti_age');
  localStorage.removeItem('amanti_segreti_sign');
  
  userNumber = null;
  currentSession = null;
  location.reload();
}

// ========== 1. LEGGI IL NUMERO DALL'URL ==========
const params = new URLSearchParams(window.location.search);
const qrNumber = params.get('n');

const loginScreen = document.getElementById('screen-login');
const chatScreen = document.getElementById('screen-chat');
const userNumberLabel = document.getElementById('user-number-label');
const logoNumberEl = document.getElementById('logo-number');
const loginError = document.getElementById('login-error');

if (!qrNumber) {
  loginError.textContent = 'QR non valido: numero mancante.';
} else {
  const sessionExists = checkSessionAndInit();
  
  if (!sessionExists) {
    userNumberLabel.textContent = `Questa sera sei il numero ${qrNumber}`;
    if (logoNumberEl) logoNumberEl.textContent = qrNumber;
  }
}

// ========== 2. RIEMPI I SELECT DI DATA DI NASCITA ==========
const daySelect = document.getElementById('dob-day');
const monthSelect = document.getElementById('dob-month');
const yearSelect = document.getElementById('dob-year');

function fillDateSelectors() {
  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    daySelect.appendChild(opt);
  }
  
  const mesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  mesi.forEach((nome, index) => {
    const opt = document.createElement('option');
    opt.value = index + 1;
    opt.textContent = nome;
    monthSelect.appendChild(opt);
  });
  
  const currentYear = new Date().getFullYear();
  const oldestYear = currentYear - 80;
  const youngestYear = currentYear - 14;
  
  for (let y = youngestYear; y >= oldestYear; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
}

fillDateSelectors();

// ========== 3. FUNZIONE PER IL SEGNO ZODIACALE ==========
function getZodiacSign(day, month) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Ariete';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Toro';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemelli';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancro';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leone';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Vergine';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Bilancia';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpione';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittario';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorno';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Acquario';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pesci';
  return 'Sconosciuto';
}

// ========== 4. FILTRO PAROLACCE / BESTEMMIE ==========
function isCleanMessage(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  const banned = ['cazzo', 'stronzo', 'vaffanculo', 'merda', 'puttana', 'porco dio', 'dio cane', 'dio porco', 'madonna', 'cristo'];
  return !banned.some(word => t.includes(word));
}

// ========== 5. ANIMAZIONE APERTURA LUCCHETTO + SUONO ==========
function playUnlockAnimation(callback) {
  const logoImg = document.getElementById('logo-img');
  const lockSound = document.getElementById('lock-sound');
  
  if (!logoImg) {
    callback();
    return;
  }
  
  const frames = ['look1.png', 'look2.png', 'look3.png', 'look4.png', 'look5.png'];
  let index = 0;
  
  const interval = setInterval(() => {
    if (index >= frames.length) {
      clearInterval(interval);
      
      if (lockSound) {
        try {
          lockSound.currentTime = 0;
          lockSound.play();
        } catch (e) {
          console.warn('Audio non riproducibile:', e);
        }
      }
      
      setTimeout(callback, 1000);
    } else {
      logoImg.src = frames[index];
      index++;
    }
  }, 80);
}

// ========== 6. CLICK SU ENTRA: SALVA UTENTE, ANIMAZIONE, POI CHAT ==========
const btnEnter = document.getElementById('btn-enter');

btnEnter.addEventListener('click', () => {
  loginError.textContent = '';
  
  if (!qrNumber) {
    loginError.textContent = 'QR non valido: numero mancante.';
    return;
  }
  
  const day = parseInt(daySelect.value, 10);
  const month = parseInt(monthSelect.value, 10);
  const year = parseInt(yearSelect.value, 10);
  
  if (!day || !month || !year) {
    loginError.textContent = 'Seleziona giorno, mese e anno.';
    return;
  }
  
  const today = new Date();
  let age = today.getFullYear() - year;
  const hasHadBirthdayThisYear = 
    (today.getMonth() + 1 > month) ||
    (today.getMonth() + 1 === month && today.getDate() >= day);
  
  if (!hasHadBirthdayThisYear) age--;
  
  const sign = getZodiacSign(day, month);
  
  const userRef = db.ref(`users/${qrNumber}`);
  btnEnter.disabled = true;
  
  userRef
    .update({
      birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      age: age,
      sign: sign
    })
    .then(() => {
      startNewSession(qrNumber, day, month, year, age, sign);
      
      daySelect.disabled = true;
      monthSelect.disabled = true;
      yearSelect.disabled = true;
      
      playUnlockAnimation(() => {
        loginScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
        btnEnter.disabled = false;
      });
    })
    .catch((error) => {
      console.error('Errore:', error);
      loginError.textContent = 'Errore di connessione, riprova tra poco.';
      btnEnter.disabled = false;
    });
});

// ========== 7. CHAT PUBBLICA (MASSIMO 10 MESSAGGI A SCHERMO) ==========
const publicInput = document.getElementById('public-text');
const publicBtn = document.getElementById('btn-send-public');
const publicList = document.getElementById('public-messages');
const MAXMESSAGES = 10;

db.ref('publicMessages')
  .limitToLast(MAXMESSAGES)
  .on('child_added', (snap) => {
    const msg = snap.val();
    if (!msg) return;
    
    const div = document.createElement('div');
    div.className = 'message-row';
    div.innerHTML = `<span class="message-number">${msg.from}</span> <span class="message-text">${msg.text}</span>`;
    
    if (publicList.firstChild) {
      publicList.insertBefore(div, publicList.firstChild);
    } else {
      publicList.appendChild(div);
    }
    
    while (publicList.children.length > MAXMESSAGES) {
      publicList.removeChild(publicList.lastChild);
    }
  });

publicBtn.addEventListener('click', () => {
  const text = publicInput.value.trim();
  
  if (!text || !userNumber) return;
  
  if (!isCleanMessage(text)) {
    alert('Messaggio non consentito. Usa un linguaggio più pulito.');
    return;
  }
  
  const ref = db.ref('publicMessages').push();
  ref.set({
    from: userNumber,
    text: text,
    ts: Date.now()
  });
  
  publicInput.value = '';
});

// ========== 8. ANIMAZIONE BARRA AFFINITÀ ==========
function animateAffinityBar(targetPercent) {
  const heart = document.getElementById('affinity-heart');
  const fill = document.getElementById('affinity-fill');
  const percentText = document.getElementById('affinity-percent');
  
  if (!heart || !fill || !percentText) return;
  
  const duration = 3000;
  const start = performance.now();
  const startPercent = 0;
  const endPercent = Math.max(0, Math.min(100, targetPercent));
  
  function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }
  
  function step(now) {
    const elapsed = now - start;
    const t = Math.min(1, elapsed / duration);
    const eased = easeOutQuad(t);
    const current = startPercent + (endPercent - startPercent) * eased;
    
    heart.style.left = current + '%';
    fill.style.width = (100 - current) + '%';
    percentText.textContent = Math.round(current);
    
    if (t < 1) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}

// ========== 9. BOTTONE SCOPRI AFFINITÀ ==========
const affinityInput = document.getElementById('affinity-target');
const affinityBtn = document.getElementById('btn-affinity');

affinityBtn.addEventListener('click', () => {
  const fakePercent = Math.floor(Math.random() * 101);
  animateAffinityBar(fakePercent);
});

// ========== 10. BOTTONE RICERCA PIÙ APPROFONDITA ==========
const screenProfileIntro = document.getElementById('screen-profile-intro');
const screenProfileQ1 = document.getElementById('screen-profile-q1');
const profileStep1 = document.getElementById('profile-step1');
const profileStep2 = document.getElementById('profile-step2');
const profileOkStep1 = document.getElementById('profile-ok-step1');
const profileOkStep2 = document.getElementById('profile-ok-step2');

let profileAnswersQ1 = {};
let currentQuestionIndex = 0;

const advancedBtn = document.getElementById('btn-advanced');

advancedBtn.addEventListener('click', () => {
  chatScreen.classList.add('hidden');
  screenProfileIntro.classList.remove('hidden');
  profileStep1.classList.remove('hidden');
  profileStep2.classList.add('hidden');
  currentQuestionIndex = 0;
});

// ========== 11. GESTIONE PROFILAZIONE (STEP 1 e 2) ==========

profileOkStep1.addEventListener('click', () => {
  profileOkStep1.classList.add('shrink');
  
  setTimeout(() => {
    profileStep1.classList.add('hidden');
    profileStep2.classList.remove('hidden');
    profileStep2.classList.add('slide-up');
  }, 400);
});

profileOkStep2.addEventListener('click', () => {
  profileOkStep2.classList.add('shrink');
  
  setTimeout(() => {
    screenProfileIntro.classList.add('hidden');
    screenProfileQ1.classList.remove('hidden');
    
    const firstQuestion = screenProfileQ1.querySelector('.question-card');
    if (firstQuestion) firstQuestion.classList.remove('hidden');
  }, 400);
});

// ========== 12. GESTIONE DOMANDE Q1 (SÌ / NO / NON SAPREI) ==========

const allQuestions = Array.from(screenProfileQ1.querySelectorAll('.question-card'));

function setupQuestionLogic(questionCard, index) {
  const dataKey = questionCard.getAttribute('data-key');
  const okLock = questionCard.querySelector('.ok-lock');
  const radios = questionCard.querySelectorAll('input[type="radio"]');
  
  okLock.addEventListener('click', () => {
    const selectedRadio = Array.from(radios).find(r => r.checked);
    
    if (!selectedRadio) {
      alert('Seleziona una risposta per continuare');
      return;
    }
    
    profileAnswersQ1[dataKey] = selectedRadio.value;
    
    radios.forEach(r => r.disabled = true);
    okLock.classList.add('shrink');
    okLock.classList.add('disabled');
    questionCard.classList.add('locked');
    
    setTimeout(() => {
      currentQuestionIndex++;
      
      if (currentQuestionIndex < allQuestions.length) {
        const nextQuestion = allQuestions[currentQuestionIndex];
        nextQuestion.classList.remove('hidden');
        nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        console.log('Risposte Q1:', profileAnswersQ1);
        
        setTimeout(() => {
          screenProfileQ1.classList.add('hidden');
          alert('Domande Q1 completate! ' + JSON.stringify(profileAnswersQ1));
        }, 500);
      }
    }, 400);
  });
}

allQuestions.forEach((card, index) => setupQuestionLogic(card, index));

