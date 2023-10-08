const tabs = await chrome.tabs.query({});

async function setPTag() {
    const key = (await chrome.storage.local.get(["key"])).key

    if (key) {
        APIKey.innerText = "XXXX-" + key.substr(key.length - 4)
    } else {
        APIKey.innerText = "XXXX-XXXX"
    }
}

const GroupButton = document.querySelector('#Group');
const SaveAPI = document.querySelector('#SaveAPI');
const DeleteAPI = document.querySelector('#DeleteAPI');
const APIKey = document.querySelector('#APIKey');
const SetAPI = document.querySelector('#SetAPI');
const NumGroup = document.querySelector('#NumGroup')
const SetGroup = document.querySelector('#SetGroup')
const price = document.querySelector('#price')
const ModelGPT = document.querySelector('#ModelGPT')

setPTag()

GroupButton.addEventListener('click', async () => {

    /*var data = []

    function getTitle() {
        let text = [...document.querySelectorAll("h1, h2, h3, h4, h4, h6, p")].reduce((pre, e) => {
            return pre + " " + e.innerText
        }, "")
        if (text === "") {
            text = document.body.innerText
        }

        return {
            title: document.title,
            text: text.length >= 400 ? text.slice(0, 398) : text
        }
    }

    for (const tap in tabs) {
        let text = {}
        try {
            //await chrome.tabs.reload(tabs[tap].id)
            if((await chrome.tabs.get(tabs[tap].id)).discarded){
                await chrome.tabs.reload(tabs[tap].id)
            }
            let f = await chrome.scripting.executeScript({
                target: {
                    tabId: tabs[tap].id
                },
                func: getTitle
            })
            text = f[0].result
            console.log(f)
        } catch (e) {
            console.log(e)
            text = {
                title: "",
                text: ""
            }
        }
        data.push({
            url: tabs[tap].url,
            id: tabs[tap].id,
            ... text
        })
    }*/

    var data = tabs.map((e)=>{return{
        url: e.url,
        id: e.id,
        title: e.title
    }})

    console.log(data)
    
    const Chat = {
        "model": ModelGPT.checked ? "gpt-4" : "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": "You sort Chrome Tabs into Groups. You get List of URLs, Title and an ID from each tab. Additional you get the maximal number of tab groups you can create. Return an JSON object witch sorts all Tabs into Groups. Try to create as many groups as you allowed as long it makes sense. Return Only the JSON. Return every id once not more not less. Also Return a small sentence with a reason why you grouped the Tabs. If there are tabs without any connection to any other topic and you used all you Tab Groups you can create one more additional Group called other.  Try matching Tabs by this weight Url: 2, title: 4, recurring words: 3 . Impotent maximal number of tabs groups never goes over Max_Tab_Groups plus one 'Other' Group and All Id´s are Returned"
            }, {
                "role": "user",
                "content": '{ "data": [ [ { "url": "https://www.google.com/search?q=gpt+api&oq=gpt+api&gs_lcrp=EgZjaHJvbWUyCQgAEEUYORiABDIHCAEQABiABDIHCAIQABiABDIHCAMQABiABDIHCAQQABiABDIHCAUQABiABDIHCAYQABiABDIHCAcQABiABDIHCAgQABiABDIHCAkQABiABNIBCDIxMDlqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8", "id": 1688536947, "title": "gpt api - Google Suche" }, { "url": "https://www.google.com/search?q=chatgpt&oq=chat&gs_lcrp=EgZjaHJvbWUqCggAEAAYsQMYgAQyCggAEAAYsQMYgAQyDwgBEEUYORiDARixAxiABDIKCAIQABixAxiABDINCAMQABiDARixAxiABDINCAQQABiDARixAxiABDINCAUQABiDARixAxiABDINCAYQABiDARixAxiABDIECAcQBdIBCDEwMzRqMGo3qAIAsAIA&sourceid=chrome&ie=UTF-8", "id": 1688536948, "title": "chatgpt - Google Suche" }, { "url": "https://www.google.com/search?q=burgerlanden&oq=burgerlanden&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIJCAEQABgKGIAEMgkIAhAAGAoYgAQyCQgDEAAYChiABDIJCAQQABgKGIAEMgkIBRAAGAoYgAQyCQgGEAAYChiABDIJCAcQABgKGIAEMgkICBAAGAoYgAQyCQgJEAAYChiABNIBCDMxMjZqMWo3qAIAsAIA&sourceid=chrome&ie=UTF-8", "id": 1688536949, "title": "burgerladen - Google Suche" } ] ], "Max_Tab_Groups": 2 } '
            }, {
                "role": "assistant",
                "content": '{"GPT Google Suchen": {"ids": [1688536947,1688536948], "reason": "Both tabs are about the GPT Model"},\n"Burgerlanden Google Suchen": {"ids": [1688536949], "reason": "The Tab is about Burgers"}}'
            }, {
                "role": "user",
                "content": `${
                    JSON.stringify({"data": data, "Max_Tab_Groups": (SetGroup.value !== SetGroup.max) ? SetGroup.value : "As Many as Needed"})
                }`
            }

        ],
        "temperature": 1,
        "max_tokens": 556,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    }

    console.log(Chat)

    const OPENAI_API_KEY = (await chrome.storage.local.get(["key"])).key

    /*let response  = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(Chat)
    })
    const answer = await response.json();
    console.log(answer)

    price.innerText = `${answer.usage.prompt_tokens * (ModelGPT.checked ? 0.00003 : 0.0000015) + answer.usage.completion_tokens * (ModelGPT.checked ? 0.00006 : 0.000002)}$`

    try{
        let groupes = JSON.parse(answer.choices[0].message.content)
        console.log(groupes)

        for (const g in groupes) {
                if(groupes[g].ids.length >= 1){
                const group = await chrome.tabs.group({"tabIds": groupes[g].ids});
                await chrome.tabGroups.update(group, {title: `${g}`});
            }
        }
    } catch(e){
        console.log(e)
    }*/
});

SetGroup.addEventListener('input', async (e) => {
    if(e.target.value !== e.target.max){
        NumGroup.innerText = e.target.value
    }else{
        NumGroup.innerText = "∞"
    }
})

SaveAPI.addEventListener('click', async () => {
    await chrome.storage.local.set({key: SetAPI.value})
    setPTag()
})

DeleteAPI.addEventListener('click', async () => {
    await chrome.storage.local.set({key: ""})
    setPTag()
})
