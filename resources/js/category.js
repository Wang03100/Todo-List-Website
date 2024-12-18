window.addEventListener("DOMContentLoaded", ()=>{
    /* ---------------------------- Delete Button ---------------------------- */
    const buttons = document.querySelectorAll(".delete input");
    for (let button of buttons){
        button.addEventListener("click", (event)=>{
            const parentRow = button.parentNode.parentNode;
            const cat = parentRow.querySelector(".categoryName").innerText;
            const json_construct = {
                "category": cat
            };
            const request_body = JSON.stringify(json_construct);
            
            call_api();

            async function call_api(){
                const url = "/api/delCat"
                const response = await fetch(url, {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json"},
                    body: request_body
                  });
                //if 400 or 500
                if (response.status === 400 || response.status === 500){
                    alert("There has been a server error.");
                }
                // if 204 or 404 then remove that row
                if (response.status === 204 || response.status === 404){
                    window.location.replace("/category");
                }

            }
        })
    }
})