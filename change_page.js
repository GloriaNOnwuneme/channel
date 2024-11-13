function insertStartFunc() {
	console.log("change issue request received");

	sessionStorage.setItem("selectCounter", 0);

	let ctsObj = {}; 

	const btnText = ["START?", "END?"];
	
	let range;
	let textNode;
	let offset;
		


	function btnFunc() {
		ctsObj[`starting${this.id.slice(-1)}`] = range;
		sessionStorage.setItem("selectCounter", parseInt(sessionStorage.getItem("selectCounter")) + 1);

		
		if (parseInt(sessionStorage.getItem("selectCounter")) % 2 !== 0) {
			document.addEventListener("click", insertBreakAtPoint);
		} else {
			let selectionObject = new Range();

			//enables back-to-front selection
			if ( Array.from(document.querySelectorAll("*")).findIndex((elem) => elem.id === "select2") <  Array.from(document.querySelectorAll("*")).findIndex((elem) => elem.id ==="select1") ) {
				temp = ctsObj["starting1"];
				ctsObj["starting1"] = ctsObj["starting2"]; 
				ctsObj["starting2"] = temp;
			}
			
			if (document.caretPositionFromPoint) {
				selectionObject.setStart(ctsObj["starting1"].offsetNode, ctsObj["starting1"].offset);
				selectionObject.setEnd(ctsObj["starting2"].offsetNode, ctsObj["starting2"].offset);
			} else if (document.caretRangeFromPoint) {							selectionObject.setStart(ctsObj["starting1"].startContainer, ctsObj["starting1"].startOffset);
				selectionObject.setEnd(ctsObj["starting2"].startContainer, ctsObj["starting2"].startOffset);
				
			} else {
				return;
			}

			setTimeout(() => {
				document.getSelection().addRange(selectionObject);
				chrome.runtime.sendMessage( { action: "issueChanged", data: document.getSelection().toString().trim() } );
			}, 100);
			console.log(document.getSelection().toString().trim());
				
			ctsObj = {};
			sessionStorage.setItem("selectCounter", 0);

			//to avoid instantly following a link if link-text selected
			setTimeout(() => {
				document.removeEventListener('click', insertBreakAtPoint);
				while (Array.from(document.getElementsByClassName('selectbtn')).length > 0) {
					Array.from(document.getElementsByClassName('selectbtn'))[0].remove();
				}
			}, 5);		
		}

		this.disabled = true;

		//delays creation of END-button
		setTimeout(() => {this.textContent = "|";}, 100);
	}

	
	function insertBreakAtPoint(e) {


/**/

		try { 
		event.preventDefault();
	
		event.stopPropagation();
		document.getSelection().removeAllRanges();
	
		if (document.caretPositionFromPoint) {
			range = document.caretPositionFromPoint(e.clientX, e.clientY);
			textNode = range.offsetNode;
			offset = range.offset;
		} else if (document.caretRangeFromPoint) {
		 	// Use WebKit-proprietary fallback method
			range = document.caretRangeFromPoint(e.clientX, e.clientY);
			textNode = range.startContainer;
			offset = range.startOffset;
  		} else {
  	 		// Neither method is supported, do nothing
 			return;
  		}


	 	if (Array.from(document.getElementsByClassName('selectbtn')).length > 0 && document.getElementById(`select${parseInt(sessionStorage.getItem("selectCounter")) + 1}`)) {
			document.getElementById(`select${parseInt(sessionStorage.getItem("selectCounter")) + 1}`).remove();
		}		

		// Only split TEXT_NODEs and avoid adding button to buttons
 		if (!textNode.parentElement.classList.contains("selectbtn") || textNode.nodeType === 3) {
 	 		let replacement = textNode.splitText(offset);
			let btn = document.createElement("button");
 			btn.className = 'selectbtn';
			btn.style.userSelect = "none";
	 		btn.setAttribute('id', `select${parseInt(sessionStorage.getItem("selectCounter")) + 1}`);
			btn.innerText = btnText[parseInt(sessionStorage.getItem("selectCounter"))];
			btn.addEventListener('click', btnFunc);
			btn.addEventListener('pointerenter', () => {btn.classList.toggle('btnhover')});
			btn.addEventListener('pointerleave', () => {btn.classList.toggle('btnhover')});
			btn.addEventListener('pointerdown', () => {btn.style.boxShadow = "inset -0.2em -0.2em 0.25em rgb(20,20,20), inset 0.2em 0.2em 0.25em rgb(20,20,20)"});
			textNode.parentNode.insertBefore(btn, replacement);
		}

		} catch(err) {
			let errNote = document.createElement("div"); 
			errNote.innerText = `Hey, sorry this isn't working out - looks like the page isn't happy ${String.fromCodePoint(0x1F605, 0x7F, 0x7F)}`;
			errNote.innerText +=  "\n\nTry moving a smidge!";
			errNote.setAttribute("id", "errnote");
			document.body.appendChild(errNote);
			setTimeout(() => {errNote.remove()}, 5000);
		}

	}

	document.addEventListener("click", insertBreakAtPoint);

}


insertStartFunc();









