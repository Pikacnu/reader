const text = document.getElementById('text');
const totalpage = document.getElementById('total');
const current = document.getElementById('current');
const zhheight = document.getElementById('zh-test').offsetHeight / 2;
const zhwidth = document.getElementById('zh-test').offsetWidth / 2;
const enheight = document.getElementById('en-test').offsetHeight / 2;
const enwidth = document.getElementById('en-test').offsetWidth / 2;
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const devicewidth = window.innerWidth;
const deviceheight = window.innerHeight;

let texts = `☆、第一卷 血雨探花 第1章 天官賜福

　　這滿天神佛裡，有一位著名的三界笑柄。

　　相傳八百年前，中原之地有一古國，名叫仙樂國。

　　仙樂古國，地大物博，民風和樂。國有四寶：美人如雲，彩樂華章，黃金珠寶。以及一位大名鼎鼎的太子殿下。

　　這位太子殿下，怎麼說呢，是一位奇男子。

　　王與後將他視為掌上明珠，寵愛有加，常驕傲道：“我兒將來必為明君，萬世流芳。”

　　然而，對於俗世的王權富貴，太子完全沒有興趣。

　　他有興趣的，用他常對自己說的一句話講，就是——

　　“我要拯救蒼生！”

　　•

　　太子少時一心修行，修行途中，有兩個廣為流傳的小故事。

　　第一個故事，發生在他十七歲時。

　　那一年，仙樂國舉行了一場盛大的上元祭天遊。

　　雖然這一項傳統神事已荒廢了數百年，但依然可以從殘存古籍和前人口述中，遙想那是怎樣一樁普天同慶的盛事。

　　上元佳節，神武大街。

　　大街兩側人山人海，王公貴族在高樓上談笑風生，皇家武士們雄風颯颯披甲開道，少女們雪白的雙手揮灑漫天落英繽紛，不知人與花孰更嬌美，金車中傳出悠揚的樂聲，在整座皇城的上空飄蕩。儀仗隊的最後，十六匹金轡白馬並行拉動著一座華台。

　　在這高高的華台之上的，便是萬眾矚目的悅神武者了。

　　祭天遊中，悅神武者將戴一張黃金面具，身著華服，手持寶劍，扮演伏魔降妖的千年第一武神——神武大帝君吾。一旦被選中，便是至高無上的榮耀，因此，挑選標準極為嚴格。這一年被選中的，就是太子殿下。舉國上下都相信，他一定會完成一場有史以來最精彩的悅神武。`;

function getpages() {
	const maxheight = Math.round(text.offsetHeight / zhheight) - 1;
	const maxwidth = Math.round(text.offsetWidth / zhwidth) / 2;
	console.log(maxheight, maxwidth);

	return texts
		.replaceAll('\n', '₩')
		.replaceAll(/，/g, '，₩')
		.replaceAll(/。/g, '。₩')
		.replaceAll('　　', '')
		.split('₩')
		.map((e) => {
			if (e.length >= maxheight) {
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
let pages = getpages();
document.addEventListener('resize', () => {
	pages = getpages();
	totalpages = pages.length;
	page = 1;
	total.innerHTML = pages.length;
	text.innerHTML = pages[0].join('');
	current.innerHTML = 1;
});
let totalpages = pages.length;
let page = 1;
total.innerHTML = pages.length;
text.innerHTML = pages[0].join('');
current.innerHTML = 1;

prev.addEventListener('click', prevpage);
next.addEventListener('click', nextpage);

function nextpage() {
	if (page < totalpages) {
		prev.disable = false;
		page++;
		text.innerHTML = pages[page - 1].join('');
		current.innerHTML = page;
	} else {
		next.disable = true;
	}
}

function prevpage() {
	if (page > 1) {
		next.disable = false;
		page--;
		text.innerHTML = pages[page - 1].join('');
		current.innerHTML = page;
	} else {
		prev.disable = true;
	}
}
document.body.addEventListener('keydown', (_) => {
	if (_.key === 'ArrowRight') nextpage();
	if (_.key === 'ArrowLeft') prevpage();
});

//page ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

const settingbar = document.getElementById('settingbar');

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
//font setting

const fontsetting = document.getElementById('fontsettingtab');
let fontsettingopen = false;

fontsetting.addEventListener('click', (_) => {
	fontsettingopen = !fontsettingopen;
	const tab = document.getElementById('textsettingtable');
	tab.classList.toggle('hidden', !fontsettingopen);
	tab.classList.toggle('touchable', fontsettingopen);
	settingclicked = true;
});

//font resizer

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

//font bold

const fontbold = document.getElementById('fontbold');

fontbold.addEventListener('input', (_) => {
	document.body.style.setProperty('--font-weight', _.target.value);
});

//color setting tab

const colorsetting = document.getElementById('colorsettingtab');
let colorsettingopen = false;

colorsetting.addEventListener('click', (_) => {
	colorsettingopen = !colorsettingopen;
	const tab = document.getElementById('colorsettingtable');
	tab.classList.toggle('hidden', !colorsettingopen);
	tab.classList.toggle('touchable', colorsettingopen);
	settingclicked = true;
});

//textcolor setting

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

//background color setting

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

//setting bar

//search text in page

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

const toggleSettingBar = () => {
	if (settingclicked) return (settingclicked = false);
	settingbar.classList.toggle('active', !isSettingbarOpen);
	const tab = document.getElementById('tablist');
	tab.classList.toggle('touchable', !isSettingbarOpen);
	isSettingbarOpen = !isSettingbarOpen;
};

document.body.addEventListener('click', (e) => {
	if (!settingbar.contains(e.target) && isSettingbarOpen) {
		toggleSettingBar();
	}
});

settingbar.addEventListener('click', toggleSettingBar);
