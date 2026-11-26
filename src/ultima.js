import "./styles/ultima.scss";
import { points, qualifiers, topics } from "./js/ultima-questions.js";

const layout = document.querySelector(".ultima__layout");
const table = layout.querySelector("table");
const scores = document.querySelector("#ultima-scores");
const turn = document.querySelector("#ultima-turn");
const dialog = document.querySelector(".ultima__dialog");
const title = document.querySelector("#ultima-dialog-title");
const content = document.querySelector("#ultima-dialog-content");
const number = new Intl.NumberFormat("ru");

let teams;
let order;
let turnIndex;
let remaining;

function button(label, action, className = "") {
	const element = document.createElement("button");
	element.type = "button";
	element.textContent = label;
	element.className = className;
	element.addEventListener("click", action);
	return element;
}

function paragraph(text, className = "") {
	const element = document.createElement("p");
	element.textContent = text;
	element.className = className;
	return element;
}

function showDialog(heading, ...elements) {
	title.textContent = heading;
	content.replaceChildren(...elements);
	if (!dialog.open) dialog.showModal();
	title.tabIndex = -1;
	title.focus();
}

dialog.addEventListener("cancel", (event) => event.preventDefault());

function startSetup() {
	layout.inert = true;
	table.replaceChildren();
	scores.replaceChildren();
	turn.textContent = "";
	teams = [];
	order = [];
	turnIndex = 0;

	const form = document.createElement("form");
	const inputs = [1, 2, 3].map((index) => {
		const label = document.createElement("label");
		label.textContent = `Команда ${index}`;
		const input = document.createElement("input");
		input.required = true;
		input.maxLength = 40;
		input.addEventListener("input", () => {
			inputs.forEach((field) => field.setCustomValidity(""));
		});
		label.append(input);
		form.append(label);
		return input;
	});
	const start = document.createElement("button");
	start.type = "submit";
	start.textContent = "Начать";
	form.append(start);
	form.addEventListener("submit", (event) => {
		event.preventDefault();
		const names = inputs.map((input) => input.value.trim());
		const normalized = names.map((name) => name.toLocaleLowerCase("ru"));
		const invalidIndex = normalized.findIndex((name, index) => !name || normalized.indexOf(name) !== index);
		if (invalidIndex !== -1) {
			inputs[invalidIndex].setCustomValidity(names[invalidIndex] ? "Названия команд должны отличаться." : "Введите название команды.");
			inputs[invalidIndex].reportValidity();
			return;
		}
		teams = names.map((name) => ({ name, score: 0 }));
		showQualifier(0);
	});
	showDialog("Названия команд", form);
	inputs[0].focus();
}

function showQualifier(index) {
	const [question, answer] = qualifiers[index];
	const heading = `Вопрос за ${index === 0 ? "первый" : "второй"} ход`;
	showDialog(heading, paragraph(question), button("Ответ получен", () => {
		const actions = document.createElement("div");
		actions.className = "ultima__actions";
		for (const team of teams.filter((candidate) => !order.includes(candidate))) {
			actions.append(button(team.name, () => {
				order.push(team);
				if (index === 0) {
					showQualifier(1);
					return;
				}
				order.push(teams.find((candidate) => !order.includes(candidate)));
				startBoard();
			}));
		}
		showDialog(heading, paragraph(question), paragraph(answer, "ultima__answer"),
			paragraph("Выберите команду, которая ответила верно."), actions);
	}));
}

function startBoard() {
	const header = table.createTHead().insertRow();
	for (const label of ["Тема", ...points]) {
		const cell = document.createElement("th");
		cell.scope = "col";
		cell.textContent = label;
		header.append(cell);
	}
	const body = table.createTBody();
	remaining = 0;
	for (const topic of topics) {
		const row = body.insertRow();
		const name = document.createElement("th");
		name.scope = "row";
		name.textContent = topic.name;
		row.append(name);
		topic.questions.forEach(([question, answer], index) => {
			const value = points[index];
			const heading = `${topic.name} за ${value}`;
			const tile = button(String(value), () => {
				const team = order[turnIndex];
				showDialog(heading, paragraph(team.name, "ultima__team"), paragraph(question), button("Ответ получен", () => {
					const actions = document.createElement("div");
					actions.className = "ultima__actions";
					actions.append(
						button("Ответ верный", () => scoreQuestion(tile, value)),
						button("Ответ неверный", () => scoreQuestion(tile, -value), "ultima__wrong")
					);
					showDialog(heading, paragraph(team.name, "ultima__team"), paragraph(question),
						paragraph(answer, "ultima__answer"), actions);
				}));
			});
			tile.setAttribute("aria-label", heading);
			row.insertCell().append(tile);
			remaining++;
		});
	}
	layout.inert = false;
	updateScores();
	dialog.close();
	table.querySelector("button").focus();
}

function updateScores() {
	const activeTeam = order[turnIndex];
	turn.textContent = remaining ? `Ход команды «${activeTeam.name}» · вопросов осталось: ${remaining}` : "Все вопросы сыграны";
	scores.replaceChildren(...order.map((team) => {
		const entry = document.createElement("li");
		const name = document.createElement("span");
		const score = document.createElement("strong");
		name.textContent = team.name;
		score.textContent = number.format(team.score);
		if (remaining && team === activeTeam) entry.setAttribute("aria-current", "true");
		entry.append(name, score);
		return entry;
	}));
}

function animateScore(score, from, to) {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		score.textContent = number.format(to);
		return Promise.resolve();
	}

	const duration = 1000;
	const start = performance.now();
	return new Promise((resolve) => {
		function frame(now) {
			const progress = Math.min(1, (now - start) / duration);
			const value = from + Math.trunc((to - from) * progress);
			score.textContent = number.format(value);
			if (progress < 1) {
				requestAnimationFrame(frame);
			} else {
				resolve();
			}
		}

		requestAnimationFrame(frame);
	});
}

async function scoreQuestion(tile, delta) {
	if (tile.disabled) return;

	const team = order[turnIndex];
	const previousScore = team.score;
	const score = scores.children[turnIndex].querySelector("strong");

	tile.disabled = true;
	tile.setAttribute("aria-label", `${tile.getAttribute("aria-label")} — сыграно`);
	team.score += delta;
	table.inert = true;
	dialog.close();
	await animateScore(score, previousScore, team.score);

	if (delta < 0) turnIndex = (turnIndex + 1) % order.length;
	remaining--;
	updateScores();
	table.inert = false;
	if (remaining) {
		table.querySelector("button:not(:disabled)").focus();
		return;
	}
	const best = Math.max(...teams.map((team) => team.score));
	const winners = teams.filter((team) => team.score === best);
	const heading = winners.length === 1 ? `Победила команда «${winners[0].name}»` : "Ничья";
	const result = winners.map((team) => `«${team.name}»`).join(", ");
	showDialog(heading, paragraph(`${result} · ${number.format(best)} баллов`),
		button("Запустить игру ещё раз", startSetup));
}

startSetup();
