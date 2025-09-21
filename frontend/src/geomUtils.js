import * as THREE from "three";
import { defaultSlabMat, lineMat } from "./config";

export async function getBox(meshArr) {
	let _main_box = new THREE.Box3();
	meshArr.forEach((e) => {
		e.geometry.computeBoundingBox();
		const b2 = new THREE.Box3().setFromObject(e);
		_main_box.union(b2);
	});
	let c = new THREE.Vector3();
	_main_box.getCenter(c);
	return c;
}

export function clearScene() {
	try {
		_meshArr.forEach((me) => {
			me.geometry.dispose();
			me.material.dispose();
			_scene.remove(me);
		});
		_meshArr = [];
	} catch (err) {}
	try {
		_lineArr.forEach((line) => {
			line.geometry.dispose();
			line.material.dispose();
			_scene.remove(line);
		});
		_lineArr = [];
	} catch (err) {}
	_main_box = new THREE.Box3();
}

export async function getMinMax(coords) {
	let ptArr = [];
	for (let i = 0; i < coords.length; i += 3) {
		let coord1 = coords[i];
		let coord2 = coords[i + 1];
		let coord3 = coords[i + 2];
		let x = parseFloat(coord1) / 1;
		let y = parseFloat(coord2) / 1;
		let z = parseFloat(coord3) / 1;
		if (isNaN(x) || isNaN(y) || isNaN(z)) {
			continue;
		} else if (check(ptArr, x, y) === false) {
			ptArr.push({ x, y, z });
		}
	}
	return ptArr;
}

export async function getMeshFromCoordinates(ptArr) {
	if (ptArr == null) {
		return null;
	} else if (!ptArr[0]) {
		return null;
	}
	const shape = new THREE.Shape();
	shape.moveTo(ptArr[0].x, ptArr[0].y);
	let z = 0;
	for (let i = 0; i < ptArr.length; i++) {
		let x = ptArr[i].x;
		let y = ptArr[i].y;
		z += ptArr[i].z;
		shape.lineTo(x, y);
	}
	//
	const extrudeSettings = {
		steps: 1,
		depth: 0.1,
		bevelEnabled: false,
	};
	//
	const g = new THREE.ExtrudeGeometry(shape, extrudeSettings);
	const me = new THREE.Mesh(g, defaultSlabMat);
	me.position.z = z / ptArr.length;
	let meLine = await getLinesForMesh(ptArr, me.position.z);
	return { me, meLine };
}

export async function getLinesForMesh(ptArr, z) {
	let pts = [];
	for (let i = 0; i < ptArr.length; i++) {
		let p = ptArr[i];
		let v = new THREE.Vector3(p.x, p.y, z);
		pts.push(v);
	}
	const g = new THREE.BufferGeometry().setFromPoints(pts);
	const me = new THREE.Line(g, lineMat);
	return me;
}

export function check(ptArr, _x, _y) {
	for (let i = 0; i < ptArr; i++) {
		let x = ptArr[i].x;
		let y = ptArr[i].y;
		if (_x === x && _y === y) {
			return true;
		}
	}
	return false;
}

export async function rePositionCamera() {
	let transformVec = await getBox(_meshArr);
	let size = new THREE.Vector3();
	_main_box.getSize(size);
	_meshArr.forEach((me) => {
		// me.position.sub(transformVec);
		me.position.x -= transformVec.x;
		me.position.y -= transformVec.y;
		me.position.z -= transformVec.z;
		me.geometry.computeBoundingBox();
		const b2 = new THREE.Box3().setFromObject(me);
		_main_box.union(b2);
		// _scene.add(me);
	});

	// _camera.position.set(size.x / 2, size.y / 2, size.z / 2);
	_camera.position.set(size.x, size.y, size.z * 10);
	_camera.lookAt(0, 0, 0);
	// _camera.rotation.x = -0.8369470598998681;
	// _camera.rotation.y = -0.0580904154213993;
	// _camera.rotation.z = -3.0892796756259906;
	// _camera.rotation.order = "XYZ";
	_controls.target.copy(new THREE.Vector3(0, 0, 0));
	_controls.update();
}

// from geom.js addbuildingKentwood()
// from init3d.js -> on key press 'c'
export function colorGradation(){
	for(let i = 0; i < _meshArr.length; i++) {
		const me = _meshArr[i];
		let emb = me.emb_car_per_area
		// console.log(emb)
		const re = emb * 4 + 100;
		me.material.color=  new THREE.Color("rgb("+re+",0,0)");
	}
}