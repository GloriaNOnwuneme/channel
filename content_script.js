

function extractSourceCode() {

let invisibleElements = [
  "area",
  "base",
  "br",
  "col",
  "colgroup",
  "embed",
  "fencedframe",
  "hr",
  "iframe",
  "img",
  "input",
  "link",
  "meta",
  "nobr",
  "noembed",
  "noframes",
  "noscript",
  "object",
  "param",
  "script",
  "source",
  "style",
  "template",
  "track",
  "wbr",
  "xmp"
];
	let extractedData = document.documentElement.outerHTML.toString();

	let parser = new DOMParser();
	let page = parser.parseFromString(extractedData, "text/html");
	invisibleElements.forEach(el => {Array.from(page.querySelectorAll(el)).forEach(elm => elm.remove()); });

	let extractedText = page.querySelector("main") ? page.querySelector("main").innerText : page.querySelector("body").innerText;
	console.log(extractedText.split(/\s+?/gim).filter(el => el).length);
	extractedText = extractedText.split(/\s+?/gim).filter(el => el).join(' ');

	chrome.storage.session.set({'webpage': extractedText});

	chrome.runtime.sendMessage({ action: "sourceExtracted", data: extractedText});

}

extractSourceCode();










