const text = document.getElementById('text');
const zhheight = document.getElementById('zh-test').offsetHeight / 2;
const zhwidth = document.getElementById('zh-test').offsetWidth / 2;
const enheight = document.getElementById('en-test').offsetHeight / 2;
const enwidth = document.getElementById('en-test').offsetWidth / 2;
const devicewidth = window.innerWidth;
const deviceheight = window.innerHeight;
const pageselecter = document.getElementById('pageselecter');

let texts = ``;
if (texts === '') texts = `你好，世界！`; // default ch
let haveChapter = false;

function getpages(isHorizontal, textinput) {
	if (isHorizontal) {
		const maxheight = Math.round(text.offsetHeight / zhheight) / 2;
		const maxwidth = Math.round(text.offsetWidth / zhwidth) - 1;
		console.log(maxheight, maxwidth);
		let data = textinput
			.replaceAll('\n', '₩')
			.replaceAll(/，/g, '，₩')
			.replaceAll(/。/g, '。₩')
			.replaceAll('　', '')
			.replaceAll(/ /g, '')
			.split('₩')
			.map((e) => {
				if (e.length >= maxwidth) {
					let test = e.match(new RegExp(`.{1,${maxwidth - 1}}`, 'g'));
					let result = [];
					for (let i = 0; i < test.length; i += 1) {
						result.push(test[i]);
					}
					return result;
				}
				return e;
			})
			.map((e) => `<span>${e}</span>`)
			.reduce((acc, cur) => {
				if (!Array.isArray(acc[acc.length - 1])) return [[acc, cur]];
				if (acc[acc.length - 1].length < maxwidth) {
					acc[acc.length - 1].push(cur);
					return acc;
				}
				acc.push([cur]);
				return acc;
			});
		return data;
	}

	const maxheight = Math.round(text.offsetHeight / zhheight) - 2;
	const maxwidth = Math.round(text.offsetWidth / zhwidth) / 2;
	console.log(maxheight, maxwidth);
	let temp = textinput;
	return temp
		.replaceAll('\n', '₩')
		.replaceAll(/，/g, '，₩')
		.replaceAll(/。/g, '。₩')
		.replaceAll('　', '')
		.replaceAll(/“/g, '﹁')
		.replaceAll(/”/g, '﹂')
		.replaceAll(/《/g, '︽')
		.replaceAll(/》/g, '︾')
		.replaceAll(/（/g, '︵')
		.replaceAll(/）/g, '︶')
		.replaceAll(/\(/g, '︵')
		.replaceAll(/\)/g, '︶')
		.replaceAll(/〔/g, '︹')
		.replaceAll(/〕/g, '︺')
		.replaceAll(/〈/g, '︿')
		.replaceAll(/〉/g, '﹀')
		.replaceAll(/【/g, '︻')
		.replaceAll(/】/g, '︼')
		.replaceAll(/：/g, ':')
		.replaceAll(/—/g, '|')
		.split('₩')
		.map((e) => {
			if (e.length >= maxheight) {
				console.log(e.match(new RegExp(`.{1,${maxheight - 1}}`, 'g')));
				return e.match(new RegExp(`.{1,${maxheight - 1}}`, 'g')).flat(1);
			}
			return e;
		})
		.reduce((acc, cur) => {
			if (!Array.isArray(acc)) acc = [acc];
			if (acc.length > 1) {
				const last = acc.pop();
				if (acc[acc.length - 1].includes(last)) {
					return acc.concat(cur);
				}
				if (last.length + cur.length <= maxheight) {
					acc.push(last + cur);
				} else {
					acc.push(last);
					acc.push(cur);
				}
			} else {
				acc.push(cur);
			}
			return acc;
		}, [])
		.map((e) => {
			if (e.match(/([^\u4E00-\u9FFF\n]+)/gm)) {
				return e.replaceAll(/([^\u4E00-\u9FFF\n]+)/gm, '<span>$1</span>');
			}
			return e;
		})
		.map((e) => `<span>${e}</span>`)
		.reduce((acc, cur) => {
			if (!Array.isArray(acc[acc.length - 1])) return [[acc, cur]];
			if (acc[acc.length - 1].length < maxwidth) {
				acc[acc.length - 1].push(cur);
				return acc;
			}
			acc.push([cur]);
			return acc;
		});
}
function pageupdate(page) {
	text.innerHTML = pages[page - 1].join('');
	current.innerHTML = page;
	totalpages = pages.length;
	totalpage.innerHTML = pages.length;
}

//chapter
// Change Chapter

const chapterprev = document.getElementById('chap-prev');
const chapternext = document.getElementById('chap-next');

let chapter = 0;

if (haveChapter) {
	chapternext.addEventListener('click', () => {
		if (chapter < totalchapters - 1) {
			chapter++;
			chapterupdate(chapter);
		}
	});
	chapterprev.addEventListener('click', () => {
		if (chapter > 0) {
			chapter--;
			chapterupdate(chapter);
		}
	});
	pageselecter.classList.toggle('space-between');
} else {
	chapternext.style.display = 'none';
	chapterprev.style.display = 'none';
}
function getChapter(text) {
	text = text.split(/-+ 第\d+章 -+/gm).map((e) => {
		return getpages(false, e);
	});
	text.shift();
	return text;
}

let chapters = getChapter(texts);
let totalchapters = chapters.length;

function chapterupdate(num) {
	if (!(chapter >= 0 && chapter < totalchapters)) return;
	pages = chapters[num];
	pageupdate(1);
	page = 1;
	chapter = num;
	document.title = `第${num}章`;
}

// Init for first page

const totalpage = document.getElementById('total');
const current = document.getElementById('current');

let pages = getpages(false, texts);
let totalpages = pages.length;
let page = 1;
total.innerHTML = pages.length;
text.innerHTML = pages[0].join('');
current.innerHTML = 1;

const prev = document.getElementById('prev');
const touchprev = document.getElementById('touchprev');
const next = document.getElementById('next');
const touchnext = document.getElementById('touchnext');

prev.addEventListener('click', nextpage);
next.addEventListener('click', prevpage);
touchnext.addEventListener('click', nextpage);
touchprev.addEventListener('click', prevpage);

function nextpage() {
	if (page < totalpages) {
		prev.disable = false;
		page++;
		pageupdate(page);
		return;
	}
	if (haveChapter && chapter !== totalchapters && page === totalpages)
		chapterupdate(chapter + 1);
	next.disable = true;
}

function prevpage() {
	if (page > 1) {
		next.disable = false;
		page--;
		return pageupdate(page);
	}
	if (haveChapter && chapter !== 0 && page === 1) chapterupdate(chapter - 1);
	prev.disable = true;
}
document.body.addEventListener('keydown', (_) => {
	if (_.key === 'ArrowRight') nextpage();
	if (_.key === 'ArrowLeft') prevpage();
});

//Day/Night mode
// Change Light Mode and Dark Mode

let light = false;

const lightchanger = document.getElementById('lightchanger');
let isSettingbarOpen = false;
let settingclicked = false;

const lightupdate = (_) => {
	light = !light;
	document.body.classList.toggle('nightly', light);
	lightchanger.innerHTML = !light
		? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>'
		: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/></svg>';
	settingclicked = true;
};

lightchanger.addEventListener('click', lightupdate);

// Font setting tab
// Change Font Setting Open

const fontsetting = document.getElementById('fontsettingtab');
let fontsettingopen = false;

fontsetting.addEventListener('click', (_) => {
	fontsettingopen = !fontsettingopen;
	const tab = document.getElementById('textsettingtable');
	tab.classList.toggle('hidden', !fontsettingopen);
	tab.classList.toggle('touchable', fontsettingopen);
	settingclicked = true;
});

// Font Size
// Change Font Size

const fontresizer = document.getElementById('fontsize');

let font = devicewidth < 700 ? 5 : 1.5;
fontresizer.min = devicewidth < 700 ? 3 : 1;
fontresizer.max = devicewidth < 700 ? 7 : 2;
fontresizer.step = devicewidth < 700 ? 0.5 : 0.1;
fontresizer.value = font;
fontresizer.addEventListener('input', (_) => {
	document.body.style.setProperty('--fontsize', `${_.target.value}vw`);
	document.body.style.setProperty(
		'--setting-fontsize',
		`${_.target.value * (devicewidth ? 4 / 5 : 1.5 / 1)}vw`,
	);
});

//Font bold
// Change Font Weight

const fontbold = document.getElementById('fontbold');

fontbold.addEventListener('input', (_) => {
	document.body.style.setProperty('--font-weight', _.target.value);
});

// Color setting tab
// Change Color Setting Open

const colorsetting = document.getElementById('colorsettingtab');
let colorsettingopen = false;

colorsetting.addEventListener('click', (_) => {
	colorsettingopen = !colorsettingopen;
	const tab = document.getElementById('colorsettingtable');
	tab.classList.toggle('hidden', !colorsettingopen);
	tab.classList.toggle('touchable', colorsettingopen);
	settingclicked = true;
});

//Textcolor setting
// Change Text Color

const textcolor = document.getElementById('textcolor');
textcolor.value = document.body.style.getPropertyValue('--text-color');

textcolor.addEventListener('input', (e) => {
	const color = e.target.value;
	document.body.style.setProperty('--text', color);
	document.getElementById('showtexthex').innerHTML = color;
	settingclicked = true;
});
textcolor.addEventListener('click', (e) => {
	settingclicked = true;
});

//Background color setting
// Change Background Color

const backgroundcolor = document.getElementById('backgroundcolor');
backgroundcolor.value = document.body.style.getPropertyValue('--text-color');

function getContrastYIQ(hexcolor) {
	var r = parseInt(hexcolor.substr(0, 2), 16);
	var g = parseInt(hexcolor.substr(2, 2), 16);
	var b = parseInt(hexcolor.substr(4, 2), 16);
	var yiq = (r * 299 + g * 587 + b * 114) / 1000;
	return yiq >= 128 ? 'black' : 'white';
}
backgroundcolor.addEventListener('input', (e) => {
	const color = e.target.value;
	document.body.style.setProperty('--background', color);
	document.body.style.setProperty('--setting', getContrastYIQ(color));
	document.getElementById('showbackhex').innerHTML = color;
	settingclicked = true;
});
backgroundcolor.addEventListener('click', (e) => {
	settingclicked = true;
});

//Setting Bar
// high light search result and remove search result when click on it

const searchtab = document.getElementById('searchtab');

let searchopen = false;

searchtab.addEventListener('click', (e) => {
	searchopen = !searchopen;
	const tab = document.getElementById('searchtable');
	tab.classList.toggle('hidden', !searchopen);
	tab.classList.toggle('touchable', searchopen);
	settingclicked = true;
});

const searchinput = document.getElementById('searchinput');

searchinput.addEventListener('click', () => {
	settingclicked = true;
});

const searchbtn = document.getElementById('search');

let searched = false;

searchbtn.addEventListener('click', (e) => {
	search(searchinput.value);
	searched = true;
	settingclicked = true;
});

const removesearch = document.getElementById('removesearch');

removesearch.addEventListener('click', (e) => {
	removeHighLight();
	searchinput.value = '';
	searched = false;
	settingclicked = true;
});

function search(target) {
	pages = pages.map((page) =>
		page.map((line) => {
			if (line.includes(target)) {
				const regex = new RegExp(target, 'g');
				return line.replace(regex, `<span class="highlight">${target}</span>`);
			}
			return line;
		}),
	);
	text.innerHTML = pages[page - 1].join('');
}
function removeHighLight() {
	pages = pages.map((page) =>
		page.map((line) => {
			if (line.includes('<span class="highlight">')) {
				line = line.replaceAll('<span class="highlight">', '');
				line = line.replaceAll('</span>', '');
			}
			return line;
		}),
	);
	text.innerHTML = pages[page - 1].join('');
}

//Text Direction
// Change Text Direction

let isHorizontal = false;

const textdirection = document.getElementById('textdirectiontab');

textdirection.addEventListener('click', (_) => {
	isHorizontal = !isHorizontal;
	textdirection.innerHTML = isHorizontal
		? '<svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m14.6961816 11.6470802.0841184.0726198 2 2c.2662727.2662727.2904793.682876.0726198.9764816l-.0726198.0841184-2 2c-.2929.2929-.7677.2929-1.0606 0-.2662727-.2662727-.2904793-.682876-.0726198-.9764816l.0726198-.0841184.7196-.7197h-10.6893c-.41421 0-.75-.3358-.75-.75 0-.3796833.28215688-.6934889.64823019-.7431531l.10176981-.0068469h10.6893l-.7196-.7197c-.2929-.2929-.2929-.7677 0-1.0606.2662727-.2662727.682876-.2904793.9764816-.0726198zm-8.1961616-8.6470802c.30667 0 .58246.18671.69635.47146l3.00003 7.50004c.1538.3845-.0333.821-.41784.9749-.38459.1538-.82107-.0333-.9749-.4179l-.81142-2.0285h-2.98445l-.81142 2.0285c-.15383.3846-.59031.5717-.9749.4179-.38458-.1539-.57165-.5904-.41781-.9749l3-7.50004c.1139-.28475.38968-.47146.69636-.47146zm8.1961616 1.14705264.0841184.07261736 2 2c.2662727.26626364.2904793.68293223.0726198.97654222l-.0726198.08411778-2 2c-.2929.29289-.7677.29289-1.0606 0-.2662727-.26626364-.2904793-.68293223-.0726198-.97654222l.0726198-.08411778.7196-.7196675h-3.6893c-.4142 0-.75-.3357925-.75-.7500025 0-.3796925.2821653-.69348832.6482323-.74315087l.1017677-.00684663h3.6893l-.7196-.7196725c-.2929-.29289-.2929-.76777 0-1.06066.2662727-.26626364.682876-.29046942.9764816-.07261736zm-8.1961616 1.62238736-.89223 2.23056h1.78445z" fill="#212121"/></svg>'
		: '<svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m13.75 12c.4142 0 .75.3358.75.75v1.6894l.7197-.7197c.2929-.2929.7677-.2929 1.0606 0s.2929.7677 0 1.0606l-2 2c-.0753.0754-.1627.1313-.2559.1679-.0489333.0192667-.1003556.0335111-.1536444.0421407l-.1207556.0097093-.0395-.00105c-.0817-.0043-.16-.0216-.2327-.0499-.0941-.0366-.1822-.0928-.2581-.1688l-2-2c-.2929-.2929-.2929-.7774 0-1.0703s.7677-.2832 1.0606.0097l.7197.7197v-1.6894c0-.4142.3358-.75.75-.75zm-8-9c.41421 0 .7500025.33579.7500025.75v10.6893l.7196675-.7196c.29289-.2929.76777-.2929 1.06066 0s.29289.7677 0 1.0606l-2 2c-.29289.2929-.76777.2929-1.06066 0l-2-2c-.29289-.2929-.29289-.7677 0-1.0606s.76777-.2929 1.06066 0l.7196725.7196v-10.6893c0-.41421.3357875-.75.7499975-.75zm7.75 0c.3067 0 .5825.18671.6964.47146l3 7.50004c.1538.3845-.0333.821-.4178.9749-.3846.1538-.8211-.0333-.9749-.4179l-.8115-2.0285h-2.9844l-.8114 2.0285c-.1539.3846-.5903.5717-.9749.4179-.38461-.1539-.57168-.5904-.41784-.9749l3.00004-7.50004c.1139-.28475.3896-.47146.6963-.47146zm0 2.76944-.8922 2.23056h1.7844z" fill="#212121"/></svg>';
	text.classList.toggle('column');
	pages = getpages(isHorizontal, texts);
	pageupdate(page);
	settingclicked = true;
});

addEventListener('resize', () => {
	pages = getpages(isHorizontal, texts);
	page = 1;
	pageupdate(page);
});

//setting bar

const settingbar = document.getElementById('settingbar');
const touchsetting = document.getElementById('touchsetting');

const toggleSettingBar = () => {
	if (settingclicked) return (settingclicked = false);
	settingbar.classList.toggle('active', !isSettingbarOpen);
	const tab = document.getElementById('tablist');
	tab.classList.toggle('touchable', !isSettingbarOpen);
	isSettingbarOpen = !isSettingbarOpen;
};

document.body.addEventListener('click', (e) => {
	if (
		!settingbar.contains(e.target) &&
		!touchsetting.contains(e.target) &&
		isSettingbarOpen
	) {
		toggleSettingBar();
	}
});

settingbar.addEventListener('click', toggleSettingBar);
touchsetting.addEventListener('click', toggleSettingBar);
