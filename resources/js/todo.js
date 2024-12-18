window.addEventListener("DOMContentLoaded", () => {
    /* ---------------------------- Status Color ---------------------------- */
    const colors = document.querySelector(".todoStatus .status");
    if (colors.innerText == "Overdue") {
        colors.style.color = "#FF000D"
    }
    else if (colors.innerText == "Done") {
        colors.style.color = "#00ff00"
    }
    else {
        colors.style.color = "#0000FF"
    }
    /* ---------------------------- Other Category Form Toggling ---------------------------- */
                            //----Event Listener For Other Selection----//
    const category = document.querySelector(".changeCategoryForm select")
    const otherForm = document.querySelectorAll(".changeCategoryForm [hidden]");
    category.addEventListener("change", unhide);
                            //----Function for unhiding Other----//
    function unhide(event) {
        let val = event.target.value;
        if (val == "Other"){
            for (let item of otherForm){
                item.removeAttribute("hidden")
            }
        }
        else{
            for (let item of otherForm){
                item.setAttribute("hidden", "");
            }
        }
    } 
    /* ---------------------------- Change Category Form ---------------------------- */
                            //----Event Listener For Form----//
    const button = document.querySelector(".changeCategoryForm .submit")
    button.addEventListener("click", (event)=>{
                            //----Grabbing Info----//  
        const category = document.querySelector(".changeCategoryForm select").value;
        const other = document.querySelector(".changeCategoryForm .other input").value;
        const id = parseInt(document.querySelector(".todoId").innerText);

        //creating JSON
        const request_body = JSON.stringify({category, other, id});

        //fetching
        call_api();

        async function call_api(){
            const url = "/api/changeCat"
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: request_body
                });
            //if 400 or 500
            if (response.status === 400 || response.status === 500){
                alert("There has been a server error.");
            }
            // if 204 or 404 then remove that row
            if (response.status === 200){
                //update category: 
                //resource: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator
                 // step 1: Check for Other
                let cat = category;
                if (cat == "Other"){
                    if (other == ""){
                        cat = "All"
                    } 
                    else{
                        cat = other;
                    }
                }
                document.querySelector(".todoCategory p").innerText = "Category: " + cat;
            }

        }
    });


    /* ---------------------------- Change Description Form Toggle ---------------------------- */
                            //----Event Listener For Option----//
    const option = document.querySelector(".option")
    let optionState = true;
    option.addEventListener("click", (event)=>{
        if (optionState == true){
            optionState = false
            document.querySelector(".desc").setAttribute("hidden", "")
            document.querySelector(".descChange").removeAttribute("hidden")
            document.querySelector(".descSubmit").removeAttribute("hidden")
        }
        else{
            optionState = true
            document.querySelector(".desc").removeAttribute("hidden")
            document.querySelector(".descChange").setAttribute("hidden", "")
            document.querySelector(".descSubmit").setAttribute("hidden", "")
        }
    })

    /* ---------------------------- Update Description ---------------------------- */
    const descSubmit = document.querySelector(".descSubmit")
    descSubmit.addEventListener("click", (event)=>{
        const change = document.querySelector(".descChange").value;
        const currentDesc = document.querySelector(".desc").innerText;
        const id = parseInt(document.querySelector(".todoId").innerText);
        if (change !== currentDesc){
            //JSON:
            const request_body = JSON.stringify({change, id});

            //API:
            call_change_api();

            let result = null;
            async function call_change_api(){
                const url = "/api/changeDescTodo"
                const response = await fetch(url, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: request_body
                });
                //if 400 or 500
                if (response.status === 400 || response.status === 500){
                    alert("There has been a server error.");
                }
                //if 302
                else if (response.status === 302){
                    window.location.replace("/todo/"+id);
                }
            }
        }
    })
    /* ---------------------------- Adding Comments ---------------------------- */
    const addComment = document.querySelector(".commentSubmit");
    addComment.addEventListener("click", (event)=>{
        const commentValue = document.querySelector(".addCommentText").value;
        const id = parseInt(document.querySelector(".todoId").innerText);
        //JSON:
        const request_body = JSON.stringify({commentValue, id});

        //API:
        call_add_comment_api();

        let result = null;
        async function call_add_comment_api(){
            const url = "/api/addCom"
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: request_body
            });
            //if 400 or 500
            if (response.status === 400 || response.status === 500){
                alert("There has been a server error.");
            }
            else if (response.status === 409){
                document.querySelector(".addComment").style.backgroundColor = "#AD3838";
            }
            //if 302
            else if (response.status === 302){
                window.location.replace("/todo/"+id);
            }
        }
    })

    /* ---------------------------- Deleting Comments ---------------------------- */
    const trash = document.querySelectorAll(".deleteComment");
    for (let button of trash){
        button.addEventListener("click", (event)=>{
            const box = button.parentNode;
            const commentValue = box.querySelector(".commentBox").innerText;
            const id = parseInt(document.querySelector(".todoId").innerText);
            //JSON:
            const request_body = JSON.stringify({commentValue, id});
    
            //API:
            call_del_comment_api();
    
            let result = null;
            async function call_del_comment_api(){
                const url = "/api/delCom"
                const response = await fetch(url, {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json"},
                    body: request_body
                });
                //if 400 or 500
                if (response.status === 400 || response.status === 500){
                    alert("There has been a server error.");
                }
                //if 200
                else if (response.status === 200){
                    const parent = box.parentNode;
                    parent.removeChild(box)
                }
            }
        })
    }
    
})