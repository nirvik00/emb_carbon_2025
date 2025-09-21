import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const controlRightButtonsToggle = [];
const rightPanel = document.getElementById("rightPanel");
const collapseBtnRight = document.getElementById("collapse-btn-right");
let isCollapsedRightPanel = false;
const collapsedRightIcon = document.getElementById("openRightIcon");
const openRightIcon = document.getElementById("collapseRightIcon");
collapseBtnRight.addEventListener("click", () => {
	console.log("collapse right button clicked");
	openRightIcon.removeAttribute("hidden");
	rightPanel.classList.toggle("open");
	if (isCollapsedRightPanel) {
		collapsedRightIcon.style.display = "block";
		openRightIcon.style.display = "none";
	} else {
		collapsedRightIcon.style.display = "none";
		openRightIcon.style.display = "block";
	}
	isCollapsedRightPanel = !isCollapsedRightPanel;
});

export { controlRightButtonsToggle };
