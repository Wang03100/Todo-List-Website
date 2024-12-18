window.addEventListener("DOMContentLoaded", ()=>{
    /* ---------------------------- Stop Form Submission ---------------------------- */
    const form = document.querySelector(".createForm");
    form.addEventListener('submit', (event)=>{
        event.preventDefault()
    })

    /* ---------------------------- Sign In ---------------------------- */
    const login = document.querySelector(".loginAccount");
    login.addEventListener('click', (event)=>{
        const username = document.querySelector(".username").value;
        const password = document.querySelector(".password").value;
        const request_body = JSON.stringify({username, password});
        call_signin_api();

        async function call_signin_api(){
            const url = "/api/login"
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: request_body
                });
            //if 400 or 500
            if (response.status === 400 || response.status === 500){
                alert("There has been a server error.");
            }
            // 404 account not found or invalid password
            else if(response.status === 404){
                alert("Username or Password is Incorrect")
            }
            // log in success
            else if (response.status === 302){
                window.location.replace("/");
            }

        }
    })

    /* ---------------------------- Sign Up ---------------------------- */
    const register = document.querySelector(".registerAccount");
    register.addEventListener('click', (event)=>{
        const username = document.querySelector(".username").value;
        const password = document.querySelector(".password").value;
        const request_body = JSON.stringify({username, password});
        call_signin_api();

        async function call_signin_api(){
            const url = "/api/register"
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: request_body
                });
            //if 400 or 500
            if (response.status === 400 || response.status === 500){
                alert("There has been a server error.");
            }
            // 409 account exist
            else if(response.status === 409){
                alert("Username already exist")
            }
            // creation success
            else if (response.status === 302){
                window.location.replace("/");
            }

        }
    })

})