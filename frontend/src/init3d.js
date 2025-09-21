import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

//
import { addLights, addSpaces } from "./geom";
import { controlLeftButtonsToggle } from "./handleLeftPanelHtmlGui";
import {
	handleOnMouseDown,
	handleMouseMove,
	resetModel,
	moveCamToSelected,
	showToast,
} from "./handleUI";

import {
	addLevelsToHtml,
	addBuildingElementTypesToHtml,
	addBuildingsFromDb,
} from "./addHtmlElements";

// globals for proj
const _clock = new THREE.Clock();
let _timer = 0;
let _countdown = 1;
let _ui_locked = false;
let _ui_lock_process = false;

// 3d start here
export async function init() {
	_scene = new THREE.Scene();
	_scene.background = new THREE.Color(0x000000);
	_camera = new THREE.PerspectiveCamera(45, _width / _height, 1, 100000);
	// after getting the size = _camera.position.set(200, 300, 250);
	_camera.up = new THREE.Vector3(0, 0, 1);
	_camera.lookAt(0, 0, 0);
	_renderer = new THREE.WebGLRenderer();
	_renderer.setSize(_width, _height);
	_container.appendChild(_renderer.domElement);
	_controls = new OrbitControls(_camera, _renderer.domElement);
	// _renderer.domElement.addEventListener("wheel", (event) => {
	// 	event.preventDefault();
	// 	const delta = event.deltaY * 0.01; // adjust speed
	// 	_camera.position.addScaledVector(_camera.getWorldDirection(new THREE.Vector3()), delta);
	// });

	//
	let lightArr = addLights();
	lightArr.forEach((e) => {
		_scene.add(e);
	});

	_scene.add(new THREE.AmbientLight(0xffffff, 0.7));

	//
	let levels = await addSpaces(); // geom.js

	//
	addLevelsToHtml(levels); // file: addHtmlElement.js
	addBuildingElementTypesToHtml(); // file: addHtmlElement.js
	addBuildingsFromDb(); // file: addHtmlElement.js

	//
	window.addEventListener("resize", updateWindow);
	render();
}

function throttle(fn, limit) {
	let waiting = false;
	return function (...args) {
		if (!waiting) {
			fn.apply(this, args);
			waiting = true;
			setTimeout(() => {
				waiting = false;
			}, limit);
		}
	};
}

// goes to handleui.js
window.addEventListener("mousemove", (evt) => {
	throttle(handleMouseMove(evt)); // file: handleUI.js
});

// goes to handleui.js
window.addEventListener("mousedown", async (evt) => {
	await handleOnMouseDown(evt); // file: handleUI.js
});

document.addEventListener("keydown", (evt) => {
	if (evt.key === "Escape") {
		// resetModel(); // file: handleUI.js
		showToast("Escape pressed- key map disabled");
	}
	// if (evt.key === "c") {
	// 	console.log(_camera.position);
	// 	console.log(_camera.rotation);
	// }
});

function updateWindow() {
	_width = window.innerWidth;
	_height = window.innerHeight;
	_renderer.setSize(_width, _height);
	_camera.aspect = _width / _height;
	_camera.updateProjectionMatrix();
}

function updateTimers() {
	_countdown -= _clock.getDelta();
	if (_countdown <= 0) {
		_countdown = 1;
		_timer++;
	}
}

function render() {
	if (!_renderer) {
		return;
	}
	updateTimers();
	updateWindow();
	//
	// if previously locked and now unlocked, reset the model
	_ui_locked = controlLeftButtonsToggle[1]; // from file: handleHtmlGui.js
	if (!_ui_locked && _ui_lock_process) {
		_ui_lock_process = false;
	}

	if (controlLeftButtonsToggle[0] === true) {
		resetModel(_camera, _scene, _meshArr, _lineArr, _controls, _main_box); // file: handleUI.js
		controlLeftButtonsToggle[0] = false;
	}
	if (controlLeftButtonsToggle[3] === true) {
		moveCamToSelected(); // file: handleUI.js
		controlLeftButtonsToggle[3] = false;
	}
	_renderer.render(_scene, _camera);
	requestAnimationFrame(render);
}
