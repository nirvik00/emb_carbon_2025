import * as THREE from "three";

// called from
/// handleUI.js handleOnMouseDown()
function getMousePos(evt) {
	const _mouse = new THREE.Vector2(0, 0);
	const _container = document.getElementById("div3d");
	const rect = _container.getBoundingClientRect();
	_mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
	_mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
	return _mouse;
}

// called from
/// handleUI.js handleOnMouseMove()
function selectMesh(evt, camera, meshArr) {
	if (camera.type !== "PerspectiveCamera") {
		_mesh_selected = [];
		return;
	}
	const _raycaster = new THREE.Raycaster();
	let _mouse = getMousePos(evt);
	_raycaster.setFromCamera(_mouse, camera);
	let intersects = _raycaster.intersectObjects(meshArr, false);
	if (intersects.length > 0) {
		var me = intersects[0].object;
		let t = false;
		for (let i = 0; i < _mesh_selected.length; i++) {
			if (me.uuid === _mesh_selected[i].uuid) {
				t = true;
			}
		}
		if (!t) {
			_mesh_selected.push(me);
		}
		return me;
	}
	return null;
}

// called from
/// handleUI.js handleOnMouseMove()
function tempSelectMesh(evt, camera, meshArr) {
	if (camera.type !== "PerspectiveCamera") {
		_mesh_selected = [];
		return;
	}
	const _raycaster = new THREE.Raycaster();
	let _mouse = getMousePos(evt);
	_raycaster.setFromCamera(_mouse, camera);
	let intersects = _raycaster.intersectObjects(meshArr, false);
	if (intersects.length > 0) {
		var me = intersects[0].object;
		_temp_mesh_selected.push(me);
		return me;
	}
	return null;
}

export { getMousePos, selectMesh, tempSelectMesh };
