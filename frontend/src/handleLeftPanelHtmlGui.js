import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
	hideElements,
	unhideElements,
	lockSelection,
	unlockSelection,
	resetModel,
	getVisibleMeshes,
	showToast,
	// getMeshesInsideRect,
} from "./handleUI";
import { rePositionCamera } from "./geomUtils";

// tooltip adjustments
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
	new bootstrap.Tooltip(el, {
		delay: { show: 15, hide: 10 }, // Show instantly
		placement: "right", // Optional
	});
	el.addEventListener("click", () => {
		const tooltip = bootstrap.Tooltip.getInstance(el);
		tooltip.hide();
	});
});

// 1.reset, 2.lock-ui, 3.show-underlay, 4.move-cam-to-selection, 5. select-levels
let controlLeftButtonsToggle = [false, false, false, false, false];
// collapse left panel
const panel = document.getElementById("gui-panel");
const collapseBtnLeft = document.getElementById("collapse-btn-left");
const collapseLeftIcon = document.getElementById("collapseLeftIcon");
const openLeftIcon = document.getElementById("openLeftIcon");
let isCollapsedLeftPanel = false;
collapseBtnLeft.addEventListener("click", () => {
	panel.classList.toggle("collapsed"); // connects html to ".collapsed" in css
	openLeftIcon.removeAttribute("hidden");
	if (isCollapsedLeftPanel) {
		collapseLeftIcon.style.display = "block";
		openLeftIcon.style.display = "none";
	} else {
		collapseLeftIcon.style.display = "none";
		openLeftIcon.style.display = "block";
	}
	isCollapsedLeftPanel = !isCollapsedLeftPanel;
});

// lock ui
const lockUIBtn = document.getElementById("lock-selection");
lockUIBtn.addEventListener("click", () => {
	controlLeftButtonsToggle[1] = !controlLeftButtonsToggle[1];
	if (!controlLeftButtonsToggle[1]) {
		showToast("reset scene");
		_global_ui_locked = false;
		unlockSelection();
		lockUIBtn.style.backgroundColor = "rgba(255, 255, 255, 1)";
	} else {
		showToast("isolate elements");
		_global_ui_locked = true;
		lockSelection();
		lockUIBtn.style.backgroundColor = "rgba(102, 44, 44, 1)";
	}
});

// controlled by render function in init3d.js
// hide element  --> goes to handleUI.js
const hideHtmlBtn = document.getElementById("hide-element");
hideHtmlBtn.addEventListener("click", () => {
	showToast("hide selected elements");
	hideElements();
});

// controlled by render function in init3d.js
// show all elements  --> goes to handleUI.js
const showHtmlBtn = document.getElementById("show-element");
showHtmlBtn.addEventListener("click", () => {
	showToast("unhide all elements");
	unhideElements();
});

// controlled by render function in init3d.js
// reset the scene
const resetSceneBtn = document.getElementById("reset-scene");
resetSceneBtn.addEventListener("click", () => {
	showToast("reset the scene");
	controlLeftButtonsToggle[0] = true;
	controlLeftButtonsToggle[1] = false;
	controlLeftButtonsToggle[2] = false;
	lockUIBtn.style.backgroundColor = "rgba(255, 255, 255, 1)";
	hideHtmlBtn.style.backgroundColor = "rgba(255, 255, 255, 1)";
	unhideElements();
	resetModel(_camera, _scene, _meshArr, _lineArr, _controls, _main_box);
});

// controlled by render function in init3d.js
// move camera to selected
const moveToSelectedBtn = document.getElementById("move-cam-to-selected");
moveToSelectedBtn.addEventListener("click", () => {
	showToast("move camera to selected element");
	controlLeftButtonsToggle[3] = !controlLeftButtonsToggle[3];
});

// controlled by render function in init3d.js
// select elements by levels
let guiLevels = [];
// let selectLevelsToggle = false;
const selectLevelsBtn = document.getElementById("select-level");
document.getElementById("level-name-selected").textContent = "ALL LEVELS";
selectLevelsBtn.addEventListener("click", (evt) => {
	evt.preventDefault();
	controlLeftButtonsToggle[4] = !controlLeftButtonsToggle[4];
});
export { controlLeftButtonsToggle, guiLevels };

/// building from db
let buildingDbBtn = document.getElementById("building-db-button");
buildingDbBtn.addEventListener("click", (evt) => {
	evt.preventDefault();
});
document.getElementById("building-from-db-info").textContent = "FACILITY";

// // selection box - only objects in current view
let selectionBoxBtn = document.getElementById("selection-box");
selectionBoxBtn.addEventListener("click", (evt) => {
	showToast("isolate visible elements");
	let visible = getVisibleMeshes();
	let tmp_meshes = [];
	console.log(visible);
	for (let i = 0; i < _meshArr.length; i++) {
		for (let j = 0; j < visible.length; j++) {
			if (_meshArr[i].uuid === visible[j].uuid) {
				tmp_meshes.push(_meshArr[i]);
				break;
			}
		}
	}
	for (let i = 0; i < _meshArr.length; i++) {
		_scene.remove(_meshArr[i]);
	}
	for (let i = 0; i < tmp_meshes.length; i++) {
		_scene.add(tmp_meshes[i]);
	}
});

// zoom extents
let zoomExtentsBtn = document.getElementById("zoom-extents");
zoomExtentsBtn.addEventListener("click", (e) => {
	e.preventDefault();
	showToast("zoom-extents");
	rePositionCamera();
});

// number of elements
let numElementsBtn = document.getElementById("num-elements");
numElementsBtn.addEventListener("click", (e) => {
	e.preventDefault();
	let visibleMeshes = 0;
	_scene.traverse((object) => {
		if (object.isMesh && object.visible) {
			visibleMeshes++;
		}
	});
	showToast(`number of elements = ${visibleMeshes}`);
});
