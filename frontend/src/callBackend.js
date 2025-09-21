import axios from "axios";
import * as THREE from "three";
import { addSpaces, addBuildingElement } from "./geom.js";
import {
	clearScene,
	getBox,
	getMinMax,
	rePositionCamera,
} from "./geomUtils.js";

import {
	addLevelsToHtml,
	addBuildingElementTypesToHtml,
	addBuildingsFromDb,
} from "./addHtmlElements";

import { showToast } from "./handleUI.js";

export async function getData() {
	let buildingFromDb = document
		.getElementById("building-from-db-info")
		.textContent.toLowerCase();
	//
	if (buildingFromDb === "facility") {
		let s =
			"/data/SpaceEquipmentData_185171_biocontainment_research_facility.json";
		let output = await fetch(s)
			.then((res) => res.json())
			.then((data) => {
				return data;
			});
		_element_type_selected = "spaces";
		return output.data;
	} else {
	}
}

export async function getBuildingElements(elementType) {
	//
	clearScene();
	const API_URL = "http://localhost:8000"// import.meta.env.VITE_API_URL;
	//
	let buildingFromDb = document
		.getElementById("building-from-db-info")
		.textContent.toLowerCase();
	_element_type_selected = elementType.toLowerCase();
	//
	if (
		elementType.toLowerCase().includes("spaces") === true &&
		buildingFromDb === "facility"
	) {
		await addSpaces();
		return;
	} else if (
		elementType.toLowerCase().includes("spaces") === true &&
		buildingFromDb === "office"
	) {
		// console.log("2. backend call: office, spaces");
		const start = performance.now();
		//
		// let url = `http://127.0.0.1:8000/db/${buildingFromDb}/spaces`;
		let url = `${API_URL}/db/${buildingFromDb}/spaces`;
		let res = await axios.get(url);
		let data = res.data.building_elements;
		//
		_element_type_selected = "spaces";
		addLevelsToHtml(res.data.unique_levels);
		await addBuildingElement(data); // file = geom.js
		const end = performance.now();
		const timeTaken = (end - start).toFixed(2);
		showToast(
			`Request completed in ${timeTaken} milliseconds, data=${data.length}`
		);
	} else if (elementType.toLowerCase().includes("building") === true) {
		// console.log("3. calling backend - building");
		const start = performance.now();
		// let url = `http://127.0.0.1:8000/db/${buildingFromDb}/building`;
		let url = `${API_URL}/db/${buildingFromDb}/building`;
		let res = await axios.get(url);
		let data = res.data.building_elements;
		//
		addLevelsToHtml(res.data.unique_levels);
		await addBuildingElement(data); // file = geom.js
		const end = performance.now();
		const timeTaken = (end - start).toFixed(2);
		showToast(
			`Request completed in ${timeTaken} milliseconds, data=${data.length}`
		);
	} else {
		const start = performance.now();
		//
		// let url = `http://127.0.0.1:8000/db/${buildingFromDb}/element/${elementType}`;
		let url = `${API_URL}/db/${buildingFromDb}/element/${elementType}`;
		// console.log("4. calling backend - element; url: ", url);
		let res = await axios.get(url);
		let data = res.data.building_elements;
		// console.log(data);
		//
		addLevelsToHtml(res.data.unique_levels);
		const end = performance.now();
		const timeTaken = (end - start).toFixed(2);
		showToast(
			`Request completed in ${timeTaken} milliseconds, data=${data.length}`
		);
		console.log(
			`Request completed in ${timeTaken} milliseconds, data=${data.length}`
		);
		await addBuildingElement(data); // file = geom.js
	}
}
