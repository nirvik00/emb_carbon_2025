import {
	levelSelected,
	elementTypeSelected,
	buildingFromDbSelected,
} from "./handleUI";

// from updates init3d.js
// from callbackend.js

export function addLevelsToHtml(levels) {
	let levelMenuList = document.getElementById("level-list");
	while (levelMenuList.children.length > 0) {
		levelMenuList.removeChild(levelMenuList.firstChild);
	}
	levels.push("ALL LEVELS");
	levels.forEach((lvl) => {
		let li = document.createElement("li");
		li.textContent = lvl;
		li.id = lvl;
		li.classList.add("list-group-item");
		li.addEventListener("click", (e) => {
			e.preventDefault(); // prevent page jump
			levelSelected(lvl); // call your custom function
		});
		levelMenuList.appendChild(li);
	});
}

export function addBuildingElementTypesToHtml() {
	let elementMenuList = document.getElementById("element-list");
	let elementTypes = [];
	if (_element_type_selected.includes("facility")) {
		elementTypes =
			"Spaces, Spaces3d, Walls, Slabs, Roofs, Doors, Furniture, Building".split(
				", "
			);
	} else {
		elementTypes =
			"Spaces, Walls, Slabs, Roofs, Doors, Windows, Furniture, Building".split(
				", "
			);
	}
	elementTypes.forEach((el) => {
		let li = document.createElement("li");
		li.textContent = el;
		li.id = el;
		li.classList.add("list-group-item");
		li.addEventListener("click", (e) => {
			e.preventDefault(); // prevent page jump
			elementTypeSelected(el); // handleUI.js
		});
		elementMenuList.appendChild(li);
	});
}

export function addBuildingsFromDb() {
	let buidlingFromDbList = document.getElementById("building-list");
	let buildingList = ["kentwood", "facility", "office"];
	buildingList.forEach((el) => {
		let li = document.createElement("li");
		li.textContent = el;
		li.id = el;
		li.classList.add("list-group-item");
		li.addEventListener("click", (e) => {
			e.preventDefault(); // prevent page jump
			buildingFromDbSelected(el); // handleUI.js
		});
		buidlingFromDbList.appendChild(li);
	});
}
