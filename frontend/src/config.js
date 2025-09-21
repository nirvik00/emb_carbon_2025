import * as THREE from "three";

let opacityVal = 0.25;
let opacityValElement = document.getElementById("opacity-range");
opacityValElement.addEventListener("change", (evt) => {
	console.log(opacityValElement.value);
	opacityVal = parseFloat(opacityValElement.value);
	_meshArr.forEach((element) => {
		element.material.opacity = opacityVal;
	});
});

export const defaultSlabMat = new THREE.MeshPhongMaterial({
	color: 0xff0000,
	transparent: true,
	opacity: opacityVal,
	side: THREE.DoubleSide,
});

export const selectedSlabMat = new THREE.MeshPhongMaterial({
	color: 0x00ff00,
	transparent: true,
	opacity: opacityVal,
	side: THREE.DoubleSide,
});

export const lineMat = new THREE.LineBasicMaterial({
	color: 0xffffff,
});

export const selectedLineMat = new THREE.LineBasicMaterial({
	color: 0xfff000,
});

export const underlayLineMat = new THREE.LineBasicMaterial({
	color: 0x424949,
});

export const wallMaterial = new THREE.MeshPhongMaterial({
	color: 0xcccccc,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: opacityVal,
});

export const doorMaterial = new THREE.MeshPhongMaterial({
	color: 0x0055cc,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: opacityVal,
});

export const windowMaterial = new THREE.MeshPhongMaterial({
	color: 0xffffff,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: opacityVal,
});

export const slabMaterial = new THREE.MeshPhongMaterial({
	color: 0x00c0ff,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: opacityVal,
});

export const roofMaterial = new THREE.MeshPhongMaterial({
	color: 0x0000cc,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: opacityVal,
});

export const spaceMaterial = new THREE.MeshPhongMaterial({
	color: 0xccc00f,
	side: THREE.DoubleSide,
	transparent: true,
	opacity: opacityVal,
});
