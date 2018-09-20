// https://github.com/spencermountain/compromise
var doc = nlp(`Amber moors`);
var str = doc.topics().out("topk");

const zeth = (function() {
  let playing, index, focus, wordArr, msg, topics;
  const o = document.getElementById('o');
  const i = document.getElementById('i');
  const read = document.getElementById('read');
  const emo = document.getElementById('emoji');
  const parse = function(words, original) {
    const hyphenate = function(str) {
      return str.length < 8
        ? str
        : str.length < 11
          ? str.slice(0, str.length - 3) + "- " + str.slice(str.length - 3)
          : str.slice(0, 7) + "- " + hyphenate(str.slice(7));
    };

    // return 2d array with word and focus point
    const arr = words
      .trim()
      .replace(/([.?!])([A-Z-])/g, "$1 $2")
      .split(/\s+/)
      .map(function(str) {
        // focus point
        for (j = focus = ((str.length - 1) / 2) | 0; j >= 0; j--)
          if (/[aeiou]/.test(str[j])) {
            focus = j;
            break;
          }

        t = 60000 / 400; // 500 wpm

        if (str.length > 6) t += t / 3;
        if (~str.indexOf(",")) t += t / 1;
        if (/[.?!]/.test(str)) t += t * 1.5;

        let rando = undefined;
        let avail = _(emoji).filter(e => e.keywords.indexOf((original || str).replace(/[^A-Z0-9]/ig, '').toLowerCase()) > -1);
        if(avail.length) rando = avail[~~(Math.random() * avail.length)];

        return str.length > 14 || str.length - focus > 7
          ? parse(hyphenate(str), str)
          : wordArr.push([str, focus, t, original || str, rando]);
      });

    return wordArr;
  };

  const start = function() {
    o.innerHTML = "&nbsp;";
    msg = new SpeechSynthesisUtterance();
    index = 0;
    playing = !playing;
    if (playing) {
      const text = i.value.trim().replace(/[_@\s]/g, " ");
      topics = nlp(text).topics().out("topk")
      wordArr = [];
      words = parse(text);
      setTimeout(loop, 1000);
    }
  };

  const loop = function() {
    w = words[index];

    read.style.width = ((index / words.length) * 100) + '%'

    if (!w) {
      // finished
      start();
      return;
    }

    if (index < 5 || index === words.length - 1 || index % 10 === 0) {
      const future =
        index < 5 || index === words.length - 1 ? index : index + 1;
      speechSynthesis.cancel(msg);
      msg = new SpeechSynthesisUtterance();
      msg.voice = speechSynthesis.getVoices()[0];
      msg.text = words[future][3];
      msg.rate = index === words.length - 1 ? 0.35 : 1.56;
      msg.pitch = 0;
      msg.lang = "en-US";
      speechSynthesis.speak(msg);
    }

    if(w[4]) {
      emo.innerHTML = w[4].char;
    }

    index++;
    o.style.color = "#ccc";
    setTimeout(() => {
      o.style.color = "black";
      o.innerHTML =
        Array(
          Math.round(
            o.getBoundingClientRect().width /
              parseInt(window.getComputedStyle(o).fontSize) *
              1.2
          ) - w[1]
        ).join("&nbsp;") +
        w[0].slice(0, w[1]) +
        "<v>" +
        w[0][w[1]] +
        "</v>" +
        w[0].slice(w[1] + 1);

      playing && setTimeout(loop, w[2] * Math.max(16 / index, 1));
    }, 10);
  };

  return {
    start
  };
})();

zeth.start();

var video = document.getElementById('video');

if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
    });
}
