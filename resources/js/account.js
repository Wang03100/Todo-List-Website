window.addEventListener("DOMContentLoaded", ()=>{
    /* ---------------------------- Sign Out ---------------------------- */
    const out = document.querySelector(".signout");
    out.addEventListener('click', (event)=>{
        const request_body = JSON.stringify({});
        call_signout_api();

        async function call_signout_api(){
            const url = "/api/logout"
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: request_body
                });
            //if 400 or 500
            if (response.status === 400 || response.status === 500){
                alert("There has been a server error.");
            }
            // log out success
            else if (response.status === 302){
                window.location.replace("/");
            }

        }
    })
})