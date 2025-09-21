import axios from "axios";
import { showToast } from "./handleUI.js";
import { addLevelsToHtml } from "./addHtmlElements.js";
import { addBuildingElement } from "./geom.js";
import { clearScene } from "./geomUtils.js";

/// submit button in llm query
document
	.getElementById("submit-query-button")
	.addEventListener("click", async function (event) {
		event.preventDefault();
		let userQuestion = document.getElementById("input-question").value;
		await askLLM(userQuestion);
	});

function getContext() {
	let buildingFromDb = document.getElementById(
		"building-from-db-info"
	).textContent;
	let elementType = document.getElementById(
		"element-type-selected"
	).textContent;
	return { buildingFromDb, elementType };
}

async function askLLM(question) {
	const start = performance.now();
	//
	const API_URL = import.meta.env.VITE_API_URL;
	// const API_URL = "http://127.0.0.1:5000";

	const { buildingFromDb, elementType } = getContext();
	let uri = `${API_URL}/ai/query`;
	// let myHeader = new Headers({"Content-Type": "application/json"});
	let postData = {
		building: buildingFromDb.toLowerCase(),
		question: question,
	};
	let res = await axios.post(uri, postData);
	// console.log("num of elements: ", res.data.building_elements.length)
	//
	const end = performance.now();
	const timeTaken = (end - start).toFixed(2);
	showToast(`AI answered the question in time ${timeTaken} milliseconds`);
	console.log(`AI answered the question in time ${timeTaken} milliseconds`);
	//
	clearScene();
	addLevelsToHtml(res.data.unique_levels);
	await addBuildingElement(res.data.building_elements); // file = geom.js
}
