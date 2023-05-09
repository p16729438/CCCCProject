let id = 0;

let a = 0;
let b = 0;

let recipe = "0";

let isFirstCalculation = true;

const limit = 1000;
let count = 0;

let p = 1n;
let q = 1n;

let powerNumbers = [];

let socket = null;

const onMessage = (ev) => {
  if (ev.data.startsWith("end")) {
    document.querySelector("#n").textContent = ev.data.split(";")[1].replace("n", "");
    document.querySelector("#loading").setAttribute("hidden", true);
    document.querySelector("#counterexample").removeAttribute("hidden");
    return;
  }

  id = parseInt(ev.data.split(";")[0]);
  a = parseInt(ev.data.split(";")[1]);
  b = parseInt(ev.data.split(";")[2]);
  recipe = ev.data.split(";")[3];
};

const onError = (ev) => {
  reload();
};

const onClose = (ev) => {
  reload();
};

setTimeout(getData, 1000);

/**
 * @returns void
 */
function getData() {
  id = 0;
  a = 0;
  b = 0;
  recipe = "0";
  isFirstCalculation = true;
  p = 0n;
  q = 0n;
  count = 0;
  powerNumbers = [];

  if (socket != null) {
    socket.removeEventListener("message", onMessage);
    socket.removeEventListener("error", onError);
    socket.removeEventListener("close", onClose);
    socket.close();
    socket = null;
  }

  socket = new WebSocket("wss://" + window.location.hostname);

  socket.addEventListener("message", onMessage);
  socket.addEventListener("error", onError);
  socket.addEventListener("close", onClose);

  setTimeout(init, 100);
}

function init() {
  p = 1n;
  q = 1n;

  for (i = 0; i < b; i++) {
    q *= 3n;
  }

  for (let i = 0; i < a - 1; i++) {
    powerNumbers.push(p);
    p *= 2n;
  }

  if (p < q) {
    isFirstCalculation = true;
  } else {
    isFirstCalculation = false;
  }

  powerNumbers.push(p);
  p *= 2n;

  setTimeout(start, 100);
}

/**
 * @returns void
 */
function start() {
  if (id != 0n && a != 0 && b != 0 && powerNumbers.length == a) {
    document.querySelector("#a").textContent = a;
    document.querySelector("#b").textContent = b;
    document.querySelector("#loading").setAttribute("hidden", true);
    document.querySelector("#calculator").removeAttribute("hidden");

    calculate();
    return;
  }

  document.querySelector("#loading").removeAttribute("hidden");
  document.querySelector("#counterexample").setAttribute("hidden", true);
  document.querySelector("#calculator").setAttribute("hidden", true);

  setTimeout(getData, 1000);
}

/**
 * @returns void
 */
function calculate() {
  if (recipe != null) {
    if (count == limit) {
      check(recipe);
      count = 0;
      nextRecipe();
      setTimeout(calculate, 10);
      return;
    }

    check(recipe);
    count++;
    nextRecipe();
    calculate();
    return;
  }

  sendData(id + ";end");

  document.querySelector("#loading").removeAttribute("hidden");
  document.querySelector("#counterexample").setAttribute("hidden", true);
  document.querySelector("#calculator").setAttribute("hidden", true);

  setTimeout(getData, 1000);
}

/**
 * @returns void
 */
function nextRecipe() {
  if (recipe.startsWith("1")) {
    if (recipe.endsWith("0")) {
      recipe = recipe.substring(0, recipe.lastIndexOf("1") + 1) + "1" + recipe.substring(recipe.lastIndexOf("1") + 2);
      recipe = recipe.substring(0, recipe.lastIndexOf("1") - 1) + "0" + recipe.substring(recipe.lastIndexOf("1"));
    } else if (recipe.endsWith("1")) {
      let i = 0;
      while (recipe[recipe.length - i - 1] == 1) {
        i++;
      }
      recipe = recipe.substring(0, recipe.length - i) + "0".repeat(i);
      recipe = recipe.substring(0, recipe.lastIndexOf("1") + 1) + "1" + recipe.substring(recipe.lastIndexOf("1") + 2);
      recipe = recipe.substring(0, recipe.lastIndexOf("1") - 1) + "0" + recipe.substring(recipe.lastIndexOf("1"));
      recipe = recipe.substring(0, recipe.lastIndexOf("1") + 1) + "1".repeat(i) + recipe.substring(recipe.lastIndexOf("1") + i + 1);
    } else {
      reload();
    }

    if (recipe.endsWith("1")) {
      return;
    }
    if (isFirstCalculation) {
      return;
    }
    nextRecipe();
    return;
  }

  recipe = null;
}

/**
 * @returns void
 */
function check() {
  const k = getK(recipe);

  if (!recipe.startsWith("0")) {
    document.querySelector("#recipe").textContent = recipe;
    document.querySelector("#k").textContent = k;

    if (k != 0n) {
      if (hasN(k)) {
        const n = k / (p - q);
        if (n > 1n) {
          sendData(id + ";" + recipe + ";" + n);
          return;
        }
      }
      if (count == limit) {
        sendData(id + ";" + recipe);
        return;
      }
    }
  }

  document.querySelector("#recipe").textContent = recipe;
  document.querySelector("#k").textContent = 0;
}

/**
 * @param {bigint} k
 * @returns boolean
 */
function hasN(k) {
  return k % (p - q) === 0n;
}

/**
 * @returns bigint
 */
function getK() {
  let k = 0n;
  for (let i = 0; i < recipe.length; i++) {
    if (recipe[i] == 1) {
      k = k * 3n + powerNumbers[i];
    }
  }

  return k;
}

/**
 * @param {string} data
 * @returns void
 */
function sendData(data) {
  if (socket != null) {
    if (socket.readyState == 1) {
      socket.send(data);
      return;
    }
  }

  reload();
}

/**
 * @returns void
 */
function reload() {
  if (socket != null) {
    socket.removeEventListener("message", onMessage);
    socket.removeEventListener("error", onError);
    socket.removeEventListener("close", onClose);
    socket.close();
    socket = null;
  }

  id = 0;
  a = 0;
  b = 0;
  recipe = "0";
  isFirstCalculation = true;
  p = 0n;
  q = 0n;

  window.location.reload();
}
