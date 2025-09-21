import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./style.css";
import { init } from "./init3d";
import * as THREE from "three";

// 3d globals
// var _scene = null;
// var _camera = null;
// var _renderer = null;
// var _controls = null;

// test();
// askLLM();
// await init(_scene, _camera, _renderer, _controls);

_container = document.getElementById("div3d");
_main_box = new THREE.Box3();
_transformVec = new THREE.Vector3(0, 0, 0);

///
await init();
