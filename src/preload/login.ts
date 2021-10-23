/* eslint-disable @typescript-eslint/no-unused-vars */
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { ipcRenderer } from "electron";

const User = {
  username: "",
  password: "",
};

window.addEventListener("DOMContentLoaded", () => {
  // hide all divs
  document.getElementById("signup-wrapper").style.display = "none";
  document.getElementById("forgot-wrapper").style.display = "none";

  // Handle buttons to dynamic login
  const loadLoginBtn = document.getElementById("loadLoginBtn");

  loadLoginBtn.addEventListener("click", () => {
    document.getElementById("login-wrapper").style.display = "initial";
    document.getElementById("signup-wrapper").style.display = "none";
    document.getElementById("forgot-wrapper").style.display = "none";

    document.getElementById("login-foot").style.display = "initial";
    document.getElementById("signup-foot").style.display = "none";
  });

  const loadSignupBtn = document.getElementById("loadSignupBtn");

  loadSignupBtn.addEventListener("click", () => {
    document.getElementById("login-wrapper").style.display = "none";
    document.getElementById("signup-wrapper").style.display = "initial";
    document.getElementById("forgot-wrapper").style.display = "none";

    document.getElementById("login-foot").style.display = "none";
    document.getElementById("signup-foot").style.display = "initial";
  });

  const loadForgotBtn = document.getElementById("login-foot").querySelector("#loadforgotBtn");

  loadForgotBtn.addEventListener("click", () => {
    document.getElementById("login-wrapper").style.display = "none";
    document.getElementById("signup-wrapper").style.display = "none";
    document.getElementById("forgot-wrapper").style.display = "initial";

    document.getElementById("login-foot").style.display = "none";
    document.getElementById("signup-foot").style.display = "none";
  });

  // get data from Login Formss to Main
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", submitLoginForm);

  function submitLoginForm(e: { preventDefault: () => void }) {
    User.username = (<HTMLInputElement>(
      document.getElementById("login-uss")
    )).value;
    User.password = (<HTMLInputElement>(
      document.getElementById("login-pass")
    )).value;

    ipcRenderer.send("user:login", User);
  }

  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", submitSignupForm);

  function submitSignupForm(e: { preventDefault: () => void }) {
    User.username = (<HTMLInputElement>(
      document.getElementById("signup-uss")
    )).value;
    User.password = (<HTMLInputElement>(
      document.getElementById("signup-pass")
    )).value;

    ipcRenderer.send("user:signup", User);
  }

  const forgotForm = document.getElementById("forgot-form");
  forgotForm.addEventListener("submit", submitForgotForm);

  function submitForgotForm(e: { preventDefault: () => void }) {
    User.username = (<HTMLInputElement>(
      document.getElementById("forgot-uss")
    )).value;
    User.password = (<HTMLInputElement>(
      document.getElementById("forgot-pass")
    )).value;

    ipcRenderer.send("user:forgot", User);
  }
});
