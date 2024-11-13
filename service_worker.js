let heartbeatInterval;

async function runHeartbeat() {
	await chrome.storage.session.set({ 'last-heartbeat': new Date().getTime() });
}

startHeartbeat();

/*

Starts the heartbeat interval which keeps the service worker alive. Call
this sparingly when you are doing work which requires persistence, and call
stopHeartbeat once that work is complete.

*/



async function startHeartbeat() {
	//Run the heartbeat once at service worker startup.
	runHeartbeat().then(() => {
	//Then again every 20 seconds.
		heartbeatInterval = setInterval(runHeartbeat, 20 * 1000);
	});
}

async function stopHeartbeat() {
	clearInterval(heartbeatInterval);
}


/*
Returns the last heartbeat stored in extension storage, or undefined if
the heartbeat has never run before.
*/

 
async function getLastHeartbeat() {
	return (await chrome.storage.session.get('last-heartbeat'))['last-heartbeat'];
}


chrome.action.onClicked.addListener((tab) => {

	chrome.sidePanel.open({ tabId: tab.id });
		
	chrome.scripting.executeScript({
		target: {tabId: tab.id},
		files: ['content_script.js']
	});		
});




chrome.runtime.onMessage.addListener((message) => {
	const API_KEY = "AIzaSyChf0G_Fm546tG5F8kkgia1RNDEsQeFqGI";
	const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;



  if (message.action === "changeIssue") {
	let queryOptions = { active: true, lastFocusedWindow: true };

	chrome.tabs.query(queryOptions)
		.then(res => { 

			// Use the tab ID to perform actions on the specific tab, such as:
				let [tab] = res;
      				if (!tab.url.includes('chrome://')) {

				chrome.scripting.executeScript({
					target: {tabId: tab.id},
					files: ['change_page.js']
				});		

				chrome.scripting.insertCSS({
					target: { tabId: tab.id },
					css: ".selectbtn {font-family: sans-serif !important; cursor: pointer !important; border: none !important; color: rgba(255,255,255,1) !important; background: darkorange !important; padding: 0.2rem !important; border-radius: 7px !important; &:disabled {opacity: 0.5 !important; cursor: not-allowed !important; border: none !important; background: none !important; color: darkorange !important; font-weight: bold !important; font-size: 1.3rem !important;}} .btnhover {box-shadow: inset -0.1em -0.1em 0.25em darkred, inset 0.1em 0.1em 0.25em darkred !important;} #errnote {display: block; position: fixed; padding: 0.8rem; z-index: 2000000 !important; border-radius: 10px; color: white; background: darkorange; width: 160px; top: 30px; right: 30px;}"
				});
			}
		    });
		  }



	if (message.action === "sourceExtracted") {
		console.log("sent sourceExtracted msg");
						
		chrome.storage.session.set({"webpage": message.data})
			.then(page => {console.log(message.data); return fetchGeminiData(message.data);})
			.then((response) => {
				chrome.runtime.sendMessage({ action: "summary", data: response });
				return true;
			})
			.catch((error) => console.error(error));

	}


	if (message.action === 'ideaGen') {
		console.log("sent ideaGen msg");
		//to readd request for "Cannot help" response as "If you can't give advice on how I can have..."

		Promise.all([
			chrome.storage.session.get("how"),
			chrome.storage.session.get("where"),
			chrome.storage.session.get("when"),
			chrome.storage.session.get('webpage')
		])
		.then(pg => {console.log(pg[3]["webpage"]); return fetch(GEMINI_API_URL, {
			method: "POST",
			body: JSON.stringify({
				contents: [
					{
						role: "user",
						parts:[{
							text: `

How can I have a positive impact on the main issue described below the 4 hashes ####? First, find the main story within the webpage text content below the ####. Give specific advice that helps me (1) ${pg[0]["how"]} (2)${pg[1]["where"]} (3)${pg[2]["when"]}.


####

${pg[3]["webpage"]}`

						}]
					}
				]
			}),
		})
		})
		.then(response => response.json())
		.then(data => data["candidates"]["0"]["content"]["parts"]["0"]["text"])
		.then(list => {
			console.log(list);
			return fetch(GEMINI_API_URL, {
			method: "POST",
			body: JSON.stringify({
				contents: [
					{
						role: "user",
						parts:[{
							text: `I have a list of ideas below the four hashes. Please do the following with them:

Subdivide the ideas into distinct ideas/micro-actions. Remove MarkUp formatting from all text, add each idea to an array, and format each idea as a JSON object structured as follows - make sure all 6 keys are present, that there's no MarkUp formatting in it, and that you only respond with this list of idea objects:

{
"title" // 5-8 word title describing the specific idea,

"description": // 1-2 sentences describing the idea further,


"search": [] // list of search template literals that I can plug into Google, if you've e.g. suggested doing further research or finding an organisation's contact details - make sure template follows good search string practice (e.g. using AND to ensure results include both words/phrases),

"template": {} // object of up to 2-3 template literals to help me action the idea - if there is no relevant template, leave this list empty. Otherwise, add object items where key equals type of text-content template (e.g. email, letter, tweet, flyer copy), and value equals array of self-contained template literals that fit this category,

"urls": {} // object of URLs (as strings) for relevant resources (e.g. courses, blogs, advocacy groups) where key equals a call-to-action phrase to visit the website, and the value is the URL string itself,

"inspo" []: // list of 1-2 short motivational phrases to inspire action
}

If you can't generate this JavaScript object, simply respond with this object: {"nogem": "No object"}.
${"\n\n"}
####

 ${"\n\n" + list}`
						}]
					}
				]
			}),
		});}
		)
		.then(resp => resp.json())
		.then(deck => {
			console.log(deck);
			let obj = deck["candidates"]["0"]["content"]["parts"]["0"]["text"].slice(deck["candidates"]["0"]["content"]["parts"]["0"]["text"].indexOf('['), deck["candidates"]["0"]["content"]["parts"]["0"]["text"].lastIndexOf(']')+1)
			chrome.runtime.sendMessage({ action: "ideaDeckReady", data: JSON.parse(obj) });
			return true;
		})
		.catch(error => {console.log(error); chrome.runtime.sendMessage({action: "ideaDeckReady", data: JSON.parse('{"nogem": "No object"}')});});
	}});








function fetchGeminiData(prompt) {

	const API_KEY = "AIzaSyChf0G_Fm546tG5F8kkgia1RNDEsQeFqGI";
	const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;

	return fetch(GEMINI_API_URL, {
		method: "POST",
		body: JSON.stringify({
			contents: [
				{
					role: "user",
					parts:[{
						text: `Give me a single-sentence summary of the following story after the four hashes ####, and start with the words 'Looks like you're reading about'. Only respond with one 10-15-word sentence. If you cannot help, simply reply with "Cannot help". ${"\n\n####\n\n" + prompt}`
					}]
				}
			]
		}),
	})
	.then((response) => response.json())
	.then((data) => {console.log(data); return data["candidates"]["0"]["content"]["parts"]["0"]["text"];})
	.catch((error) => console.error(error));

//OBJECT WITH EXAMPLE NEWS STORIES GO HERE!!!!!!

	 
}