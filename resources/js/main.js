window.addEventListener("DOMContentLoaded", ()=>{
    /* ---------------------------- Status Color ---------------------------- */
    const colors = document.querySelectorAll(".status");
    for (let color of colors){
        if (color.innerText == "Overdue"){
            color.style.color = "#FF000D"
        }
        else if (color.innerText == "Done"){
            color.style.color = "#00ff00"
        }
        else{
            color.style.color = "#0000FF"
        }
    }

    let hidden = document.querySelectorAll(".adding [hidden]");
    const adding = document.querySelector(".adding");
    const stayHidden = document.querySelectorAll(".other [hidden]");
    const addButton = document.getElementById('add');

    /* ---------------------------- Toggling Add Todo Form ---------------------------- */
    let state = true;
    addButton.addEventListener('click', (event)=>{
        formToggle()
    })
                            //----Form Toggle Helper Function----//
    function formToggle(){
        if (state){
            addButton.src = "/images/minus.png";
            state = false;
            //unhide
            adding.removeAttribute("hidden");
            adding.style.padding = "1em";
            for (let item of hidden){
                item.removeAttribute("hidden");
            }
            for (let item of stayHidden){
                item.setAttribute("hidden", "");
            }
        }
        else{
            addButton.src = "/images/plus.png";
            state = true;
            //rehides
            adding.setAttribute("hidden", "");
            adding.style.padding = "0";
            for (let item of hidden){
                item.setAttribute("hidden", "");
            }
            //recolors:
            adding.style.backgroundColor = "#75B855";
            //reset form:
            document.querySelector(".addName input").value = "";
            document.querySelector(".addTime input").value = "";
            document.querySelector(".addDesc textarea").value = "";
            document.querySelector(".addCategory select").value = "";
            document.querySelector(".other input").value = "";
        }
    }

    /* ---------------------------- Other Category Form Toggling ---------------------------- */
                            //----Event Listener For Other Selection----//
    const category = document.getElementById("category")
    const otherForm = document.querySelectorAll(".other [hidden]");
    category.addEventListener("change", unhide);
                            //----Function for unhiding Other----//
    function unhide(event) {
        let val = event.target.value;
        if (val === "Other"){
            for (let item of otherForm){
                item.removeAttribute("hidden")
            }
        }
        else{
            for (let item of otherForm){
                item.setAttribute("hidden", true);
            }
        }
    } 
    /* ---------------------------- Delete Button ---------------------------- */
    const buttons = document.querySelectorAll(".delete input");
    for (let button of buttons){
        button.addEventListener("click", (event)=>{
            const parent = button.parentNode.parentNode;
            const id = parent.querySelector(".todoId").innerText;
            const json_construct = {
                "todoId": parseInt(id)
            };
            const request_body = JSON.stringify(json_construct);
            
            call_api();

            async function call_api(){
                const url = "/api/delTodo"
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
                    const table = parent.parentNode
                    table.removeChild(parent);
                }

            }
        })
    }
    /* ---------------------------- Check Checker ---------------------------- */
    //https://www.w3schools.com/howto/howto_js_display_checkbox_text.asp
    const checkBox = document.querySelectorAll(".check");

    for (let box of checkBox){
        box.addEventListener("change", (event)=>{
            //Swapping row with table
            const boxRow = box.parentNode.parentNode;
            const boxTable = boxRow.parentNode;
            const overdueTable = document.querySelector(".overdueTable table tbody");
            const comingTable = document.querySelector(".comingTable table tbody");
            //JSON Data
            const status = boxRow.querySelector(".status");
            const id = boxRow.querySelector(".todoId").innerText;
            // Ensuring Updates Check Marks
            let checked;

            //JSON Creation with var checked updating
            let json_construct;
            if(event.target.checked){
                checked = true;
                json_construct = {
                    "todoId": parseInt(id),
                    "status": "Done"
                };
            }
            else{
                checked = false;
                json_construct = {
                    "todoId": parseInt(id),
                    "status": "Not-Done"
                };
            }
            const request_body = JSON.stringify(json_construct);
            
            call_del_api();

            async function call_del_api(){
                const url = "/api/changeStatus"
                const response = await fetch(url, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: request_body
                  });
                //if 400 or 500
                if (response.status === 400 || response.status === 500){
                    alert("There has been a server error.");
                }
                // 202 not overdue
                if (response.status == 202){
                    if(checked){
                        status.innerText = "Done"
                        status.style.color = "#00ff00"
                        //move tables
                        boxTable.removeChild(boxRow);
                        comingTable.append(boxRow);
                    }
                    else{
                        status.innerText = "Not-Done"
                        status.style.color = "#0000FF"
                    }
                }
                // 200 - overdue
                if (response.status == 200){
                    if(checked){
                        status.innerText = "Done"
                        status.style.color = "#00ff00"
                    }
                    else{
                        status.innerText = "Overdue"
                        status.style.color = "#FF000D"
                        //move tables
                        boxTable.removeChild(boxRow);
                        overdueTable.append(boxRow);
                    }
                }

            }
        })
    }
    /* ---------------------------- Add Todo Form ---------------------------- */
    const formSubmit = document.getElementById("addForm");
    formSubmit.addEventListener("submit", (event)=>{
        event.preventDefault();
        //Get Form Value
        const name = document.querySelector(".addName input").value;
        const time = document.querySelector(".addTime input").value;
        const description = document.querySelector(".addDesc textarea").value;
        const category = document.querySelector(".addCategory select").value;
        const other =  document.querySelector(".other input").value;

        //JSON:
        const json_construct = {
            name,
            time,
            description,
            category,
            other
        };
        const request_body = JSON.stringify(json_construct);

        //API:
        call_add_todo_api();

        let result = null;
        async function call_add_todo_api(){
            const url = "/api/addTodo"
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: request_body
            });
            //if 400 or 500
            if (response.status === 400 || response.status === 500){
                alert("There has been a server error.");
            }
            //if 409
            else if (response.status == 409){
                //red background
                const wallpaper = document.querySelector(".adding");
                wallpaper.style.backgroundColor = "#751937";
            }
            //if 302
            else if (response.status === 302){
                window.location.replace("/");
            }
        }
    })
})