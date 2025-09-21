import * as THREE from "three";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";

// imports from my project
import {selectMesh, getMousePos, tempSelectMesh} from "./meshSelection";
import {
    defaultSlabMat,
    selectedSlabMat,
    lineMat,
    selectedLineMat,
    underlayLineMat,
    wallMaterial,
    doorMaterial,
    windowMaterial,
    slabMaterial,
} from "./config";

import {getBuildingElements} from "./callBackend.js";
import {rePositionCamera} from "./geomUtils.js";


import axios from 'axios'
// globals
let _selectedIndex = [];
let _spacesInfoTable = document.getElementById("mesh-info-table");
let _transformVec = new THREE.Vector3(0, 0, 0);
let _textMeshArr = [];
let _is_ui_locked = false;
//
// called from init3d.js render()
export function lockUi(t) {
    /// immediately reset model when state changes from lock to unlock
    if (_is_ui_locked === true && t === false) {
        _is_ui_locked = t;
        return true;
    }
    _is_ui_locked = t;
    return false;
}

// from updateMeshInfo()
function clearMeshInfo() {
    while (_spacesInfoTable.children.length > 1) {
        _spacesInfoTable.removeChild(_spacesInfoTable.lastChild);
    }
}

/// called from
/// onMouseDown()
function updateMeshInfo(meshArr) {
    clearMeshInfo(); // above
    let tBody = document.createElement("tbody");
    meshArr.forEach((me) => {
        let t = false;
        for (let i = 0; i < _mesh_selected.length; i++) {
            if (_mesh_selected.uuid === me.uuid) {
                t = true;
                break;
            }
        }
        if (!t) {
            let tdNum = document.createElement("td");
            let tdName = document.createElement("td");
            let tdLevel = document.createElement("td");
            let tdArea = document.createElement("td");
            tdNum.textContent = me.number;
            tdName.textContent = me.spaceName;
            tdLevel.textContent = me.level;
            tdArea.textContent = me.area;
            let tr = document.createElement("tr");
            tr.appendChild(tdNum);
            tr.appendChild(tdName);
            tr.appendChild(tdLevel);
            tr.appendChild(tdArea);
            tBody.appendChild(tr);
        }
    });
    _spacesInfoTable.appendChild(tBody);
}

function updateMeshInfoArrKentwood(meshArr){
    clearMeshInfo(); // above
    let tBody = document.createElement("tbody");
    meshArr.forEach((me) => {
        let t = false;
        for (let i = 0; i < _mesh_selected.length; i++) {
            if (_mesh_selected.uuid === me.uuid) {
                t = true;
                break;
            }
        }
        if (!t) {
            let tdNum = document.createElement("td");
            let tdName = document.createElement("td");
            let tdLevel = document.createElement("td");
            let tdArea = document.createElement("td");
            let tdEmbCarbon = document.createElement("td");
            tdNum.textContent = me.number;
            tdName.textContent = me.spaceName;
            tdLevel.textContent = me.level;
            tdArea.textContent = me.area;
            tdEmbCarbon.textContent = me.emb_car_per_area;
            let tr = document.createElement("tr");
            tr.appendChild(tdNum);
            tr.appendChild(tdName);
            tr.appendChild(tdLevel);
            tr.appendChild(tdArea);
            tr.appendChild(tdEmbCarbon);
            tBody.appendChild(tr);
        }
    });
    _spacesInfoTable.appendChild(tBody);
}

// called from init3d.js onMouseMove()
export async function handleMouseMove(evt) {
    if (_is_ui_locked) {
        return;
    }
    let p = document.getElementById("mouseover-name");
    let p2 = document.getElementById("mouseover-guid");
    _meshArr.forEach((me, i) => {
        if (!_selectedIndex.includes(i)) {
            // me.material = defaultSlabMat;
            setMaterialToMesh(me);
            try {
                _lineArr[i].material = lineMat;
            } catch (err) {
            }
        }
    });
    //if (!_global_ui_locked) {
    // deselect all selected meshes
    // select meshes
    if (_camera.type === "PerspectiveCamera" && _meshArr.length > 0) {
        let me = tempSelectMesh(evt, _camera, _meshArr); // file: meshSelection.js
        if (me) {
            me.material = selectedSlabMat;
            if (!_global_ui_locked) {
                p.innerHTML = me.spaceName;
                p2.innerHTML = me.uuid;
            }
        } else {
            p.innerHTML = "";
            p2.innerHTML = "";
        }
    } else {
        console.log("no camera or meshes in scene: arr=", _meshArr.length);
    }
    _temp_mesh_selected = [];
}

// called from init3d.js onMouseDown()
export async function handleOnMouseDown(evt) {
    if (evt.button === 2) {
        _meshArr.forEach((me, i) => {
            setMaterialToMesh(me);
        });
    }
    let mos = getMousePos(evt); // file: meshSelection.js
    if (mos.x < -0.8 || mos.x > 0.7) {
        return;
    }
    if (_camera.type === "PerspectiveCamera" && _meshArr.length > 0) {
        let me = selectMesh(evt, _camera, _meshArr); // file: meshSelection.js

        if (me && _scene.children.includes(me)) {
            let index = _meshArr.indexOf(me);
            if (evt.button === 0) {
                // console.log(me);
                // select on left click
                me.material = selectedSlabMat;
                try {
                    if (lineArr[index]) {
                        lineArr[index].material = selectedLineMat;
                    }
                } catch (err) {
                }
                _selectedIndex.push(index);
            } else if (evt.button === 2) {
                // deselect on right click
                // let i2 = _selectedIndex.indexOf(index);
                // if (i2 !== -1) {
                //     _selectedIndex.splice(i2, 1);
                // }
                // me.material = defaultSlabMat;
                setMaterialToMesh(me);
                clearMeshInfo();
                try {
                    if (lineArr[index]) {
                        lineArr[index].material = lineMat;
                    }
                } catch (err) {
                }
                _selectedIndex = [];
                _mesh_selected = [];
            }
        }
    } else {
        console.log("no camera");
    }
    let xArr = [];
    let buildingFromDb = document.getElementById("building-from-db-info").textContent.toLowerCase();
    // console.log(buildingFromDb);
    for (const e of _selectedIndex) {
        const i = _selectedIndex.indexOf(e);
        let me = _meshArr[e];
        // console.log(spaceId);
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (buildingFromDb === 'kentwood') {
            try {
                let arr = me.spaceName.split(":")
                let spaceIdFromSpaceName = arr[arr.length - 1];
                const {area, emb_car_per_area} = await getDataFromEmbodiedCarbon(spaceIdFromSpaceName);
                _meshArr[e].area = area;
                _meshArr[e].emb_car_per_area = emb_car_per_area;
            } catch (err) {
                // console.log(err)
            }
        }
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        xArr.push(_meshArr[e]);
    }
    if (buildingFromDb !== 'kentwood') {
        updateMeshInfo(xArr); // above
    }else{
        updateMeshInfoArrKentwood(xArr) // above
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getDataFromEmbodiedCarbon(num) {
    const API_URL = "http://127.0.0.1:8000"
    let buildingFromDb = document
        .getElementById("building-from-db-info")
        .textContent.toLowerCase();
    // let elementType = _element_type_selected;
    // _element_type_selected = elementType.toLowerCase();
    // let url = `http://127.0.0.1:8000/db/${buildingFromDb}/spaces`;
    let url = `${API_URL}/db/${buildingFromDb}/get/${num}`;
    let res = await axios(url);
    let data = res.data;
    let area = data[6]
    let emb_car_per_area = data[7]
    return {area, emb_car_per_area};
}

function checkMesh(me, scene) {
    const geometry = me.geometry;
    geometry.computeBoundingBox();
    const center = new THREE.Vector3();
    geometry.boundingBox.getCenter(center);
    const worldCenter = new THREE.Vector3();
    me.localToWorld(worldCenter.copy(center));
    return worldCenter;
}

function loadText(cen, scene, count) {
    // console.log(cen);
    const loader = new FontLoader();
    loader.load("/fonts/helvetiker_regular.typeface.json", function (font) {
        const geometry = new TextGeometry("#" + count, {
            font: font,
            size: 10,
            depth: 1,
            bevelEnabled: false,
        });

        const material = new THREE.MeshStandardMaterial({color: 0xffffff});
        const textMesh = new THREE.Mesh(geometry, material);
        textMesh.rotation.x = Math.PI / 2;
        textMesh.scale.set(0.1, 0.1, 0.1);
        textMesh.position.set(cen.x, cen.y, cen.z);
        _textMeshArr.push(textMesh);
        scene.add(textMesh);
    });
}

export function resetModel() {
    clearMeshInfo();
    _textMeshArr.forEach((me) => {
        me.geometry.dispose();
        me.material.dispose();
        _scene.remove(me);
    });
    _textMeshArr = [];
    _meshArr.forEach((me, i) => {
        //me.material = defaultSlabMat;
        setMaterialToMesh(me);
        _scene.add(me);
        try {
            _lineArr[i].material = lineMat;
            _scene.add(_lineArr[i]);
        } catch (err) {
        }
    });
    // if (_element_type_selected === "spaces") {
    // 	_meshArr.forEach((me, i) => {
    // 		//me.material = defaultSlabMat;
    // 		setMaterialToMesh(me);
    // 		_scene.add(me);
    // 		try {
    // 			_lineArr[i].material = lineMat;
    // 			_scene.add(_lineArr[i]);
    // 		} catch (err) {}
    // 	});
    // } else {
    // 	_meshArr.forEach((me, i) => {
    // 		me.material = defaultSlabMat;
    // 		_scene.add(me);
    // 	});
    // }
    rePositionCamera();
}

export function lockSelection() {
    if (_selectedIndex && _selectedIndex.length < 1) {
        return;
    }
    _meshArr.forEach((me, i) => {
        _scene.remove(me);
        try {
            _scene.remove(_lineArr[i]);
        } catch (err) {
        }
    });
    let xArr = [];
    _selectedIndex.forEach((e, i) => {
        let me = _meshArr[e];
        xArr.push(me);
        // me.material = defaultSlabMat;
        setMaterialToMesh(me);
        _scene.add(me);
        try {
            _lineArr[e].material = lineMat;
            _scene.add(_lineArr[e]);
        } catch (err) {
        }
        let c = checkMesh(me, _scene);
        loadText(c, _scene, me.number.toString());
    });
    _global_ui_locked = true;
    updateMeshInfo(xArr);
}

export function unlockSelection() {
    console.log("unlock");
    _textMeshArr.forEach((te) => {
        te.geometry.dispose();
        te.material.dispose();
        _scene.remove(te);
    });
    _textMeshArr = [];

    _meshArr.forEach((me, i) => {
        _scene.add(me);
        try {
            _scene.add(_lineArr[i]);
        } catch (err) {
        }
    });
    _mesh_selected = [];
    _selectedIndex = [];
    _global_ui_locked = false;
    clearMeshInfo();
}

// from handleLeftPanelHtmlGui.js
export function hideElements() {
    if (_selectedIndex && _selectedIndex.length < 1) {
        return;
    }
    if (_mesh_selected.length < 1) {
        return;
    }
    // for (let i = 0; i < _meshArr.length; i++) {
    for (let j = 0; j < _mesh_selected.length; j++) {
        // if (_meshArr[i].uuid === _mesh_selected[j].uuid) {
        // 	_scene.remove(_meshArr[i]);
        // }
        _scene.remove(_mesh_selected[j]);
    }
    //}
}

export function unhideElements() {
    clearMeshInfo();
    if (_global_ui_locked) {
        return;
    }
    if (_selectedIndex && _selectedIndex.length < 1) {
        return;
    }
    if (_mesh_selected.length < 1) {
        return;
    }
    for (let i = 0; i < _meshArr.length; i++) {
        _scene.add(_meshArr[i]);
        // for (let j = 0; j < _mesh_selected.length; j++) {
        // 	if (_meshArr[i].uuid === _mesh_selected[j].uuid) {
        // 		_scene.add(_meshArr[i]);
        // 		_meshArr[i].material = defaultSlabMat;
        // 	}
        // }
    }
    try {
        for (let i = 0; i < _lineArr.length; i++) {
            _lineArr[i].material = lineMat;
        }
    } catch (err) {
        console.log(err);
    }
    _selectedIndex = [];
    _mesh_selected = [];
}

export function moveCamToSelected() {
    if (_selectedIndex.length === 0) {
        return;
    }
    const box = new THREE.Box3();
    _selectedIndex.forEach((e) => {
        let me = _meshArr[e];
        me.geometry.computeBoundingBox();
        const box2 = new THREE.Box3().setFromObject(me);
        box.union(box2);
    });
    // const helper = new THREE.Box3Helper(box, 0x00ff00); // green outline
    // scene.add(helper);
    let b = box.max;
    let center = new THREE.Vector3();
    let size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    _camera.lookAt(center.x, center.y, center.z);
    _camera.position.set(b.x, b.y, b.z);
    _controls.target.copy(center);
    _controls.update();
}

// from init3d.js
export function levelSelected(levelName) {
    document.getElementById("level-name-selected").textContent = levelName;
    _meshArr.forEach((e, i) => {
        if (e.hidden === true) {
            e.position.z -= 100000;
            try {
                _lineArr[i].position.z -= 100000;
            } catch (err) {
            }
            e.hidden = false;
        }
    });
    if (levelName === "ALL LEVELS") return;
    _meshArr.forEach((e, i) => {
        if (e.level.includes(levelName)) {
            e.hidden = false;
        } else {
            e.hidden = true;
            e.position.z += 100000;
            try {
                _lineArr[i].hidden = true;
                _lineArr[i].position.z += 100000;
                _lineArr[i].material = underlayLineMat;
            } catch (err) {
            }
        }
    });
}

// from init3d.js
export async function elementTypeSelected(elementType) {
    document.getElementById("element-type-selected").textContent =
        elementType.toUpperCase(); // from
    let elemType = elementType.toLowerCase();
    await getBuildingElements(elemType); // backend.js calls the api for data
}

// from init3d.js
export async function buildingFromDbSelected(elementType) {
    document.getElementById("building-from-db-info").textContent =
        elementType.toUpperCase(); // from
}

// from handleLeftPanelHtmlGui.js
export function getVisibleMeshes() {
    const visible = [];

    // Update camera matrices
    _camera.updateMatrix();
    _camera.updateMatrixWorld();
    _camera.updateProjectionMatrix();

    // Build frustum
    const frustum = new THREE.Frustum();
    const projScreenMatrix = new THREE.Matrix4().multiplyMatrices(
        _camera.projectionMatrix,
        _camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);

    // traverse scene
    _scene.traverse((obj) => {
        if (obj.isMesh) {
            // compute world bounding box
            obj.geometry.computeBoundingBox();
            const box = obj.geometry.boundingBox.clone();
            box.applyMatrix4(obj.matrixWorld);

            if (frustum.intersectsBox(box)) {
                visible.push({uuid: obj.uuid, name: obj.name || ""});
            }
        }
    });

    return visible;
}

export function showToast(message, duration = 3000) {
    const container = document.getElementById("toast-container");

    // Create toast element
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    container.appendChild(toast);

    // Trigger animation (next frame)
    requestAnimationFrame(() => toast.classList.add("show"));

    // Remove after duration
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300); // wait for fade-out
    }, duration);
}

export function setMaterialToMesh(me) {
    if (me.elementType === null || me.elementType === undefined) {
        me.material = defaultSlabMat;
        return;
    }
    if (me.elementType.includes("wall") === true) {
        me.material = wallMaterial;
    } else if (me.elementType.includes("door") === true) {
        me.material = doorMaterial;
    } else if (me.elementType.includes("window") === true) {
        me.material = windowMaterial;
    } else if (me.elementType.includes("floor") === true) {
        me.material = slabMaterial;
    } else if (me.elementType.includes("roof") === true) {
        me.material = roofMaterial;
    } else {
        me.material = defaultSlabMat;
    }
}
