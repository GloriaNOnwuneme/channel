

const resultsElement = document.getElementById("results");

let loadingDiv = document.querySelector("#loading-div");
let ideaGenForm = document.querySelector("#idea-gen-form");
let contentComment = document.querySelector("#content-comment");
let contentCtn = document.querySelector("#content-ctn");
let quizContainer = document.querySelector("#quiz-container");

let resultsDiv = document.querySelector("#results-div");
let resultsComment = document.querySelector("#results-comment");
let shuffle = document.querySelector("#shuffle");

let reviewAnswersBtn = document.querySelector("#review-answers-btn");
let hideQuizBtn = document.querySelector("#hide-quiz-btn");

let contentCommentScroller = document.querySelector("#content-comment-scroller");
let contentInput = document.querySelector("#content-input");
let fieldSets = Array.from(document.querySelectorAll("#idea-gen-form fieldset"));
let editBtns = Array.from(document.querySelectorAll(".edit-btn"));
let issueId = document.querySelector("#issue-id");
let issueChange = document.querySelector("#issue-change");
let issueChangeId = document.querySelector("#issue-change-id");
let issueManual = document.querySelector("#issue-manual");


let quizBtns = document.querySelector("#quiz-btns");
let prevBtn = document.querySelector("#prev-btn");
let nextBtn = document.querySelector("#next-btn");

let shareResultsBtn = document.querySelector("#share-results-btn");
let shareResultsCtn = document.querySelector("#share-results-ctn");

let newsqsReviewPrompt = document.querySelector("#newsqs-reviewprompt");
let newqsBtn = document.querySelector("#newqs-btn");
let summaryBtn = document.querySelector("#summary-btn");
let summaryCtn = document.querySelector("#summary-ctn");

let urlChangeModal = document.querySelector("#url-change-modal");

let shareBtn = document.querySelector("#share-btn");
let shareBtnCtn = document.querySelector("#share-btn-ctn");

let newsqsReview = document.querySelector("#newsqs-review");


document.onreadystatechange = () => {
	if (document.readyState == "complete") {
		if (loadingDiv) {
			loadingDiv.classList.add("remove-div");
			setTimeout(() => {loadingDiv.remove();}, 200);
		}
		
	}
}







let currentQuestionIndex = 0; // make sure this resets to 0 when navigating to new URL




chrome.runtime.onMessage.addListener((message) => {

	if (message.action==="issueChanged") {
		console.log(message.data);
		issueManual.value = message.data;
		issueChangeId.style.display = "block";
	}

	if (message.action === "summary") {
		issueId.style.display = "block";
		issueChange.style.display = "block";

		if (!message.data.toLowerCase().includes("cannot help")) {
			contentComment.querySelector("p").innerText = message.data + "\n\nReady to make a difference?";
		} else {
			issueId.display="none";
			issueChangeId.innerText = '';
			issueChange.classList.add('manual-set');
			
		}
	}


	if (message.action === "ideaDeckReady") {
		if (!message.data.nogem) {
			displayIdeas(message.data); //REMOVE FROM COMMENTS WHEN USING API

			/*Comment out the following when using API
			contentComment.querySelector("p").innerText = message.data[0] + "\n\nReady to make a difference?";
			displayIdeas(message.data[1]);
			console.log(message.data[1]);
			Comment out the above when using API*/		

		} else {
			console.log("Can't generate idea deck"); alert("Can't generate deck");
		}
	}


			/*Comment out the following when using API
	
			issueChange.innerText = '';
			issueChange.classList.add('manual-set');
			issueId.style.display = "block";
			//issueChange.style.display = "block";

			Comment out the above when using API*/
	

});




	function requestIdeas() {

		event.preventDefault();

		quizContainer.classList.add("quiz-collapse");
		chrome.runtime.sendMessage({action: "ideaGen"}); // REMOVE FROM COMMENT WHEN USING API

	}


	ideaGenForm.addEventListener("submit", requestIdeas);


	issueId.addEventListener("click", () => {contentCtn.style.display="none";});
	issueChangeId.addEventListener("click", () => {contentCtn.style.display="none"; chrome.storage.session.set({'webpage' : issueManual.value }); 
 });
	issueChange.addEventListener("click", () => {
		contentInput.scrollIntoView({block: "nearest"});
		chrome.runtime.sendMessage({action: "changeIssue"});
	});

	document.querySelector("#place").addEventListener("input", () => {
		document.querySelector("#where").value = document.querySelector("#place").value;
		document.querySelector("label:has(#where)").classList.add("label-btn");
		/*init(document.querySelector("#where").value);*/

		if (document.querySelector("#where").value) {
			document.querySelector("label:has(#where)").addEventListener("click", (e) => {
				if (fieldSets[0].classList.contains("hide")) {
					e.target.parentElement.parentElement?.previousElementSibling.classList.remove("hide");
				}
			}, {once: true,});
		}


	});
	



	document.querySelector("#place").addEventListener("keydown", (e) => {if (e.code === "Enter") {e.preventDefault(); document.querySelector("label[for='where']").click();}});


	fieldSets.forEach((field) => {
		if (field.nextElementSibling) {field.classList.add('hide');}
	});


	

	fieldSets.forEach((field) => {

		field.addEventListener("click", e => {
			if (e.target.classList.contains('label-btn') && !Array.from(field.querySelectorAll('input')).some(el => !el.value)) {
				field.classList.add('hide');
										
				let val = (e.target.querySelector('input').getAttribute("name") === "how") ? e.target.querySelector('input').value.split('-').join(' ') : (e.target.querySelector('input').getAttribute("name") === "where") ? " at a " + e.target.querySelector('input').value + " level" : " on " + e.target.querySelector('input').value.split('-').join(' ');
				let obj = { [`${e.target.querySelector('input').getAttribute("name")}`] : val};
				chrome.storage.session.set(obj);
				document.querySelector(`#${e.target.querySelector('input').getAttribute("name")}-summary`).innerText = val.replace("one off", "one-off");
	console.log(e.target.querySelector('input').value);


			}
		});
	});


	editBtns.forEach((btn,i) => btn.addEventListener("click", () => {

		fieldSets.slice(1,4)[2-i].classList.remove('hide');

	}));


	let labelBtns = Array.from(document.querySelectorAll(".label-btn"));


	labelBtns.forEach(label => {
		label.addEventListener("click", (e) => {
			if (fieldSets[0].classList.contains("hide")) {
				e.target.parentElement.parentElement?.previousElementSibling.classList.remove("hide");
			}
		}, {once: true,});
	});




async function displayIdeas(ideaData) {
	resultsDiv.querySelector("#ideas-deck") && resultsDiv.querySelector("#ideas-deck").remove();

	let ideasObj = await ideaData;


	const ideasDeck = document.createElement("div");
	ideasDeck.id = "ideas-deck";
	

	if (ideasObj["no_article"]) {
		contentComment.querySelector("p").innerText = ideasObj["no_article"];
		contentComment.querySelector("button").style.display = "none";
	} else {



		//contentComment.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,.7), transparent), url('${ideasObj[i]["img"]}')`;
		for (let i = 0; i < ideasObj.length; i++) {
			let set = document.createElement("div");
			set.classList.add("idea-card");

			let expandBtn = document.createElement("button");
			expandBtn.classList.add("expand-btn");
			expandBtn.innerText = "More Info";

			let title = document.createElement("h2");
			let description = document.createElement("p");
			title.innerText = ideasObj[i].title;
			description.innerText = ideasObj[i].description;

			set.append(title);
			set.append(description);

			let moreDetails = document.createElement("div");
			moreDetails.classList.add("more-details");
			// let urlRegex = /\[https.+?\]\(https.+?\)/;

			expandBtn.addEventListener("click", (e) => {
				e.target.remove();
				set.classList.add("idea-expand");
				set.append(moreDetails);
			});


			if (ideasObj[i].urls && Object.keys(ideasObj[i].urls).length) {
				let searchDesc = document.createElement("p");
				searchDesc.innerText = "Handy weblinks";
				moreDetails.append(searchDesc);

				(Object.keys(ideasObj[i].urls)).forEach(cta => {

					/*need to add check for url.responseStatus first with fetch??*/
					let link = document.createElement('a');
					link.innerText = cta; // change once ideasDeck.urls changed into array of object, where key = CTA - once done, text = object's key
					link.href = ideasObj[i].urls[cta].includes('](') ? ideasObj[i].urls[cta].split('](').at(-1).slice(0,-1) : ideasObj[i].urls[cta];
					link.setAttribute("target", "_blank");
					link.classList.add("idea-resource");
					let detailsIcon = document.createElement("span");
					detailsIcon.classList.add("details-icon");
					link.append(detailsIcon);
					moreDetails.append(link);
				});
			}

			if (ideasObj[i].template && Object.keys(ideasObj[i].template).length) {

				let searchDesc = document.createElement("p");
				searchDesc.innerText = "Some templates to help you spread the word";
				moreDetails.append(searchDesc);

				Object.keys(ideasObj[i].template).forEach(key => {

				ideasObj[i].template[key].forEach(temp => {
					let templateCtn = document.createElement("div");
					templateCtn.classList.add("template-ctn");
					let template = document.createElement("div");
					template.innerText = temp;
					template.classList.add("template");
					let showTemplateBtn = document.createElement("button");
					showTemplateBtn.classList.add("show-template");
					let copyBtn =  document.createElement("button");
					copyBtn.classList.add("copy-btn");

					showTemplateBtn.innerText = `Show ${key.toLowerCase()} template`; // change once ideasDeck.template items changed into array of objects - once done, text = object's key
					showTemplateBtn.addEventListener("click", () => {templateCtn.classList.contains("show") 
						? templateCtn.classList.remove("show")
						: templateCtn.classList.add("show");});

					copyBtn.addEventListener("click", () => {
						let text = temp;
						navigator.clipboard.writeText(text)
						.then(navigator.clipboard.readText());	
					});
						
					template.append(copyBtn);
					templateCtn.append(showTemplateBtn);
					templateCtn.append(template);
					moreDetails.append(templateCtn);
				});

				});

			}


			if (ideasObj[i].search && ideasObj[i].search.length) {
				let searchDesc = document.createElement("p");
				searchDesc.innerText = "Some search words to guide your exploration";
				moreDetails.append(searchDesc);
				ideasObj[i].search.forEach(string => {
					let searchString = document.createElement("button");
					let template = document.createElement("div");
					searchString.innerText = string;
					searchString.addEventListener("click", () => {
						let text = `"${string}"`;
						navigator.clipboard.writeText(text)
						.then(navigator.clipboard.readText());	
					});
					searchString.classList.add("search-btn");
					let searchIcon = document.createElement("span");
					searchIcon.classList.add("search-icon");
					searchString.append(searchIcon);

					moreDetails.append(searchString);

				});
			}

			if ([(ideasObj[i].search && ideasObj[i].search.length), (ideasObj[i].template && Object.keys(ideasObj[i].template).length), (ideasObj[i].urls && Object.keys(ideasObj[i].urls).length)].some(el => el)) {
				set.append(expandBtn);
			}
					
			ideasDeck.append(set);
			shuffle.style.visibility = "visible";
		}
		resultsDiv.querySelector("svg").remove();

		let closeSet = document.createElement("div");
		closeSet.classList.add("idea-card");

		let closeBtn = document.createElement("button");
		closeBtn.classList.add("expand-btn");
		closeBtn.innerText = "Start Over";

		closeBtn.addEventListener("click", () => {
			location.reload();

			let queryOptions = { active: true, lastFocusedWindow: true };

			chrome.tabs.query(queryOptions).then(res => {

				let [tab] = res;
				chrome.scripting.executeScript({
					target: {tabId: tab.id},
					files: ['content_script.js']
				});		
			});
		});

		closeSet.append(closeBtn);

		ideasDeck.prepend(closeSet);

		resultsDiv.prepend(ideasDeck);
		shuffle.addEventListener("click", () => {
				if (Array.from(ideasDeck.children).length) {if (Array.from(ideasDeck.children).at(-1).querySelector(".more-details")) {Array.from(ideasDeck.children).at(-1).querySelector(".more-details").remove(); Array.from(ideasDeck.children).at(-1).classList.remove("idea-expand");} Array.from(ideasDeck.children).at(-1).classList.add("scrap-idea"); 
if (Array.from(ideasDeck.children).at(-2)) {Array.from(ideasDeck.children).at(-2).style.animationPlayState = "running";}
setTimeout(() => Array.from(ideasDeck.children).at(-1).remove(), 500);}
			}
		);
	
	}
}




contentComment.querySelector("button").addEventListener("click", () => {
	contentCtn.style.display = "none";

});
