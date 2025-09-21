import * as THREE from "three";
import { ObjectLoader } from "three";
import {
	defaultSlabMat,
	doorMaterial,
	lineMat,
	slabMaterial,
	wallMaterial,
	windowMaterial,
} from "./config";
import {
	getBox,
	clearScene,
	getMinMax,
	getMeshFromCoordinates,
	getLinesForMesh,
	check,
	rePositionCamera,
	colorGradation,
} from "./geomUtils";

import axios from 'axios';

import { getData } from "./callBackend.js";

export function addLights() {
	let lightArr = [];
	let l = new THREE.HemisphereLight(0x00fcff);
	let l2 = new THREE.DirectionalLight(0x00fcff);
	lightArr.push(l);
	lightArr.push(l2);
	return lightArr;
}

// from init3d.js = init()
export async function addSpaces() {
	let data = await getData();
	let meshArr = [];
	let lineArr = [];
	let allPts = [];
	let levels = [];
	for (let i = 0; i < data.length; i++) {
		if (typeof data[i].coordinates === "undefined") {
			continue;
		}
		try {
			let coords = data[i].coordinates.split(",");
			let ptArr = await getMinMax(coords);
			ptArr.forEach((p) => {
				allPts.push(p);
			});
			let { me, meLine } = await getMeshFromCoordinates(ptArr);
			if (!me) {
				continue;
			}
			try {
				me.category = data[i].category;
			} catch (err) {
				me.category = "category_not_in_data";
			}
			me.number = i;
			me.spaceName = data[i].spaceName;
			me.spaceFullName = data[i].spaceFullName;
			me.level = data[i].level;
			me.area = data[i].area;
			me.spaceId = data[i].spaceId;
			meshArr.push(me);
			lineArr.push(meLine);
			if (!levels.includes(data[i].level)) {
				levels.push(data[i].level);
			}
			_camera.position.set(size.x, size.y, size.z * 10);
			_controls.target.copy(new THREE.Vector3(0, 0, 0));
			_controls.update();
		} catch (err) {
			// console.error(err);
			// console.log(data[i].coordinates);
		}
	}
	// let transformVec = await getCenVec(allPts);
	let transformVec = await getBox(meshArr);
	meshArr.forEach((me) => {
		// me.position.sub(transformVec);
		me.position.x -= transformVec.x;
		me.position.y -= transformVec.y;
		me.position.z -= transformVec.z;
	});
	lineArr.forEach((me) => {
		//me.position.sub(transformVec);
		me.position.x -= transformVec.x;
		me.position.y -= transformVec.y;
		me.position.z -= transformVec.z;
	});
	addSpacesToScene(meshArr, lineArr, transformVec, levels);
	return levels;
}

export function addSpacesToScene(meshArr, lineArr, transformVec, levels) {
	_transformVec = transformVec;
	meshArr.forEach((e) => {
		_scene.add(e);
		_meshArr.push(e);
		e.geometry.computeBoundingBox();
		const b2 = new THREE.Box3().setFromObject(e);
		_main_box.union(b2);
	});

	let size = new THREE.Vector3();
	_main_box.getSize(size);
	let center = new THREE.Vector3();
	_camera.position.set(size.x, size.y, size.z * 10);
	_camera.lookAt(0, 0, 0);
	_main_box.getCenter(center); // same as __main_box. can be changed
	_controls.target.copy(center);
	_controls.update();

	//
	lineArr.forEach((e) => {
		_scene.add(e);
		_lineArr.push(e); // this is now a group
	});
}

export async function addBuildingElement(data) {
	// clearScene()
	for (let i = 0; i < data.length; i++) {
		if (
			data[i].guid === "2Fyy0AqID87fAozzcQhaal" ||
			data[i].element_type.includes("IfcCovering")
		) {
			continue;
		}
		let elem = data[i];
		let vertices = elem.vertices;
		let faces = elem.faces;
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(vertices, 3)
		);
		geometry.setIndex(faces);
		geometry.computeVertexNormals();
		// materials from config.js - loaded directly in index.html
		let material = defaultSlabMat;
		let me = new THREE.Mesh(geometry, material);
		try {
			if (data[i].element_type.includes("IfcWall")) {
				me.material = wallMaterial;
				me.elementType = "wall";
			} else if (data[i].element_type.includes("IfcDoor")) {
				me.material = doorMaterial;
				me.elementType = "door";
			} else if (data[i].element_type.includes("IfcWindow")) {
				me.material = windowMaterial;
				me.elementType = "window";
			} else if (data[i].element_type.includes("IfcSlab")) {
				me.material = slabMaterial;
				me.elementType = "floor";
			} else if (
				data[i].element_type.includes("IfcRoof") ||
				data[i].element_type.includes("IfcCovering")
			) {
				me.material = roofMaterial;
				me.elementType = "roof";
			} else {
				me.elementType = "unknown";
			}
		} catch (err) {
			me.elementType = "unknown";
		}
		me.number = i;
		me.spaceName = data[i].product_name;
		me.spaceFullName = data[i].product_name;
		me.level = data[i].level;
		me.area = data[i].area;
		me.spaceId = data[i].guid;
		me.guid = data[i].guid;
		const b2 = new THREE.Box3().setFromObject(me);
		_main_box.union(b2);
		_meshArr.push(me);
		_scene.add(me);
	}
	// adding to scene, camera postision updated in geomUtils.js - rePositionCamera
	await rePositionCamera();
}


export async function addBuildingElementKentwood(data) {
	// clearScene()
	for (let i = 0; i < data.length; i++) {
		if (
			data[i].guid === "2Fyy0AqID87fAozzcQhaal" ||
			data[i].element_type.includes("IfcCovering")
		) {
			continue;
		}
		let elem = data[i];
		let vertices = elem.vertices;
		let faces = elem.faces;
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(vertices, 3)
		);
		geometry.setIndex(faces);
		geometry.computeVertexNormals();
		// materials from config.js - loaded directly in index.html
		let material = new THREE.MeshPhongMaterial({color: "rgb(255,0,0)"});
		let me = new THREE.Mesh(geometry, material);
		try {
			if (data[i].element_type.includes("IfcWall")) {
				me.material = wallMaterial;
				me.elementType = "wall";
			} else if (data[i].element_type.includes("IfcDoor")) {
				me.material = doorMaterial;
				me.elementType = "door";
			} else if (data[i].element_type.includes("IfcWindow")) {
				me.material = windowMaterial;
				me.elementType = "window";
			} else if (data[i].element_type.includes("IfcSlab")) {
				me.material = slabMaterial;
				me.elementType = "floor";
			} else if (
				data[i].element_type.includes("IfcRoof") ||
				data[i].element_type.includes("IfcCovering")
			) {
				me.material = roofMaterial;
				me.elementType = "roof";
			} else {
				me.elementType = "unknown";
			}
		} catch (err) {
			me.elementType = "unknown";
		}
		me.number = i;
		me.spaceName = data[i].product_name;
		me.spaceFullName = data[i].product_name;
		me.level = data[i].level;
		me.area = data[i].area;
		me.spaceId = data[i].guid;
		try {
			let arr = me.spaceName.split(":")
			let spaceIdFromSpaceName = arr[arr.length - 1];
			const {area, emb_car_per_area} = await getDataFromEmbodiedCarbon(spaceIdFromSpaceName);
			me.area = area;
			me.emb_car_per_area = emb_car_per_area;
		} catch (err) {
			// console.log(err)
		}
		me.guid = data[i].guid;
		const b2 = new THREE.Box3().setFromObject(me);
		_main_box.union(b2);
		_meshArr.push(me);
		_scene.add(me);
	}
	// colorGradation(); // geomutils
	// adding to scene, camera position updated in geomUtils.js - rePositionCamera
	await rePositionCamera();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getDataFromEmbodiedCarbon(num) {
	const API_URL = "http://127.0.0.1:8000"
	let buildingFromDb = document
		.getElementById("building-from-db-info")
		.textContent.toLowerCase();
	let url = `${API_URL}/db/${buildingFromDb}/get/${num}`;
	let res = await axios(url);
	let data = res.data;
	let area = data[6]
	let emb_car_per_area = data[7]
	return {area, emb_car_per_area};
}
