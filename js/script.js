console.log('lets write js');

let progress = 0;

let currentSong = null;
let currentAudio = new Audio();
let percent = 0;
let isHovering = false;
let currfolder;
let currentLi = null;
let liElements = [];


function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    mins = mins < 10 ? `0${mins}` : mins;
    secs = secs < 10 ? `0${secs}` : secs;

    return `${mins}:${secs}`;
}

// fetch the list of all the songs from the local directory and return the list of songs
async function getSongs(folder) {
    currfolder = folder;
    let response = await fetch("songs.json");
    let data = await response.json();
    let folderData = data.folders.find(f => f.name === folder);
    songs = [];
    liElements = [];
    songs = folderData ? folderData.songs : [];

    // display the list of songs in the UI

    let songUl = document.querySelector('.songList').getElementsByTagName('ul')[0];
    songUl.innerHTML = "";
    for (const song of songs) {

        let info = getSongInfo(song);


        const li = document.createElement('li');

        li.innerHTML += `
                        
                <img class="invert" src="img/music.svg" alt="Music" /> 
                <div class="info ">
                    <div> ${info.song}</div>
                    <div> ${info.artist}</div>
                </div>
                <img src="img/playsong.svg" alt="Play" />
        
            `;


        songUl.appendChild(li);
        liElements.push(li)
        li.addEventListener("click", () => {
            if (currentLi) {
                currentLi.getElementsByTagName('img')[1].src = "img/playsong.svg";
                currentLi.getElementsByTagName('img')[0].src = "img/music.svg";
                currentLi.getElementsByTagName('img')[0].classList.add('invert');

                currentLi.classList.remove('active');
            }

            if (currentSong === song) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    li.getElementsByTagName('img')[1].src = "img/pausesong.svg";
                    li.getElementsByTagName('img')[0].src = "img/playing.svg";
                    li.getElementsByTagName('img')[0].classList.remove('invert');
                    play.src = "img/pausesong.svg";
                } else {
                    currentAudio.pause();
                    li.getElementsByTagName('img')[1].src = "img/playsong.svg";
                    li.getElementsByTagName('img')[0].src = "img/music.svg";
                    li.getElementsByTagName('img')[0].classList.add('invert');
                    play.src = "img/playsong.svg";
                }
                currentLi = li;
                li.classList.add('active');
                return;
            }

            currentSong = song;
            currentLi = li;
            li.classList.add('active');
            li.getElementsByTagName('img')[1].src = "img/pausesong.svg";
            li.getElementsByTagName('img')[0].src = "img/playing.svg";
            li.getElementsByTagName('img')[0].classList.remove('invert');
            currentAudio.src = `songs/${currfolder}/${song}`;
            currentAudio.play();
            play.src = "img/pausesong.svg";
            document.querySelector('.songInfo').innerHTML = `<span>${info.song} - ${info.artist}</span>`;;
            document.querySelector('.songTime').innerHTML = "00:00 / 00:00";
        });
    }
    return songs;

}

function getSongInfo(filename) {
    let cleaned = decodeURIComponent(filename).replace(/\.mp3$/i, "").trim();
    let parts = cleaned.split(' - ');
    return {
        song: parts[0] ? parts[0].trim() : cleaned,
        artist: parts[1] ? parts[1].trim() : "Unknown"
    };
}


function playmusic(song) {
    song.play();
    let play = document.getElementById('play');

    if (currentAudio.paused) {
        currentAudio.play();
        play.src = "img/pausesong.svg";
    } else {
        currentAudio.pause();
        play.src = "img/playsong.svg";
    }
}

async function showInitialSongInfo(track, startpaused = false) {
    console.log("track:", track);
    console.log("songs array:", songs);
    console.log("trackIndex:", songs.indexOf(track));
    console.log("liElements length:", liElements.length);
    if (currentLi) {
        currentLi.getElementsByTagName('img')[1].src = "img/playsong.svg";
        currentLi.getElementsByTagName('img')[0].src = "img/music.svg";
        currentLi.getElementsByTagName('img')[0].classList.add('invert');
        currentLi.classList.remove('active');
        currentLi = null;
    }

    let trackIndex = songs.indexOf(track);
    if (trackIndex !== -1 && liElements[trackIndex]) {
        currentLi = liElements[trackIndex];
        currentLi.getElementsByTagName('img')[1].src = "img/pausesong.svg";
        currentLi.getElementsByTagName('img')[0].src = "img/playing.svg";
        currentLi.getElementsByTagName('img')[0].classList.remove('invert');
        currentLi.classList.add('active');
    }
    let play = document.getElementById('play');
    let info = getSongInfo(track);

    progress = 0;
    document.querySelector('.circle').style.left = `calc(0% - 6px)`;
    document.querySelector('.seekBar').style.background = 
        `linear-gradient(to right, white 0%, white 0%, #555 0%, #555 100%)`;


    document.querySelector('.songInfo').innerHTML = `<span>${info.song} - ${info.artist}</span>`;
    document.querySelector('.songTime').innerHTML = "00:00 / 00:00";

    currentAudio.src = `songs/${currfolder}/${track}`;
    currentSong = track;

    if (!startpaused) {

        currentAudio.play();
        play.src = "img/pausesong.svg";
        currentLi.getElementsByTagName('img')[1].src = "img/pausesong.svg";
        currentLi.getElementsByTagName('img')[0].src = "img/playing.svg";
        currentLi.getElementsByTagName('img')[0].classList.remove('invert');
    }
    else {
        currentAudio.load();
        play.src = "img/playsong.svg";
        currentLi.getElementsByTagName('img')[1].src = "img/playsong.svg";
        currentLi.getElementsByTagName('img')[0].src = "img/music.svg";
        currentLi.getElementsByTagName('img')[0].classList.add('invert');
    }
}

async function displayAlbum() {
    let response = await fetch("songs.json");
    let data = await response.json();
    let cardContainer = document.querySelector('.cardContainer');

    for (const folder of data.folders) {
        if (folder.songs.length === 0) continue;

        cardContainer.innerHTML += `
        <div data-folder="${folder.name}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="75" height="75">
                <circle cx="12" cy="12" r="10" fill="#2ECC71" />
                <path d="M9.5 8L16.5 12L9.5 16V8Z" fill="black" />
                </svg>
            </div>
            <img src="songs/${folder.name}/cover.jpg" alt="${folder.name}" />
            <h3>${folder.title}</h3>
            <p>${folder.description}</p>
        </div>`;
    }
}

async function main() {

    // dispay the list of songs in the UI
    await displayAlbum();

    // get the list of all the song 
    await getSongs("Atif Aslam");

    // show default pasued song info in the UI
    if (songs.length === 0) {
        document.querySelector('.songInfo').innerHTML = "No songs found";
        return;
    } else {

        await showInitialSongInfo(songs[0], true);
    }

    Array.from(document.getElementsByClassName('card')).forEach(e => {
        e.addEventListener('click', async (item) => {
            songs = await getSongs(item.currentTarget.dataset.folder);
            await showInitialSongInfo(songs[0]);
            console.log(liElements);

            if (window.matchMedia("(hover: none)").matches) {
                document.querySelector('.left').style.left = "0";
            }
        });
    });

    play.addEventListener('click', () => {
        if (currentAudio.paused) {
            currentAudio.play();
            play.src = "img/pausesong.svg";
            if (currentLi) currentLi.getElementsByTagName('img')[1].src = "img/pausesong.svg";
            if (currentLi) currentLi.getElementsByTagName('img')[0].src = "img/playing.svg";
            if (currentLi) currentLi.getElementsByTagName('img')[0].classList.remove('invert');
        } else {
            currentAudio.pause();
            play.src = "img/playsong.svg";
            if (currentLi) currentLi.getElementsByTagName('img')[1].src = "img/playsong.svg";
            if (currentLi) currentLi.getElementsByTagName('img')[0].src = "img/music.svg";
            if (currentLi) currentLi.getElementsByTagName('img')[0].classList.add('invert');
        }
    });


    currentAudio.addEventListener('timeupdate', () => {
        if (!currentAudio.duration) return;

        document.querySelector('.songTime').innerHTML = `${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}`;
        progress = (currentAudio.currentTime / currentAudio.duration) * 100;

        document.querySelector('.circle').style.left = `calc(${progress}% - 6px)`;
        if (!isHovering) {
            document.querySelector('.seekBar').style.background = `linear-gradient(to right, white 0%, white ${progress}%, #555 ${progress}%, #555 100%)`;
        }
        if (currentAudio.currentTime === currentAudio.duration) {
            let nextIndex = (songs.indexOf(currentSong) + 1) % songs.length;
            showInitialSongInfo(songs[nextIndex]);
        }
    });


    // add event listener to the seekbar 
    document.querySelector('.seekBar').addEventListener('click', (e) => {
        percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100

        progress = percent;
        document.querySelector('.circle').style.left = percent + "%";
        currentAudio.currentTime = (percent / 100) * currentAudio.duration;

        if (window.matchMedia("(hover: none)").matches) {
            document.querySelector('.seekBar').style.background =
                `linear-gradient(to right, white 0%, white ${progress}%, #555 ${progress}%, #555 100%)`;
        } else {
            document.querySelector('.seekBar').style.background =
                `linear-gradient(to right, #1DB954 0%, #1DB954 ${progress}%, #555 ${progress}%, #555 100%)`;
        }
    });
    // add event listener to the hameburger menu
    document.querySelector(".hameBurger").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "0";
         isHovering = false; 
    });

    // add event listener to the close button of the left 
    document.querySelector('.close').addEventListener('click', (e) => {
        document.querySelector('.left').style.left = "-100%";
        isHovering = false; 
    })

    //  add event litener to the previous button
    document.getElementById('previous').addEventListener('click', () => {
        console.log('previous button clicked');
        let currentIndex = songs.indexOf(currentSong);
        if (currentIndex > 0) {
            showInitialSongInfo(songs[currentIndex - 1]);
        }
        else {
            showInitialSongInfo(songs[songs.length - 1]);
        }
    });

    //  add event litener to the next button
    document.getElementById('next').addEventListener('click', () => {
        console.log('next button clicked');
        let currentIndex = songs.indexOf(currentSong);
        if (currentIndex < songs.length - 1) {
            showInitialSongInfo(songs[currentIndex + 1]);
        }
        else {
            showInitialSongInfo(songs[0]);
        }
    });

    const seekBar = document.querySelector(".seekBar");

    seekBar.addEventListener("mouseenter", () => {
        isHovering = true;
    });


    seekBar.addEventListener("mousemove", (e) => {
        if (window.matchMedia("(hover: none)").matches) return;
        document.querySelector('.circle').style.opacity = 1;
        if (!currentAudio.duration) return;
        let playpercent = (e.offsetX / seekBar.getBoundingClientRect().width) * 100;
        seekBar.style.background =
            `linear-gradient(
            to right,
            #1DB954 0%,
            #1DB954 ${progress}%,
            
            #B3B3B3 ${progress}%,
            #B3B3B3 ${playpercent}%,
            
            #535353 ${playpercent}%,
            #535353 100%
            )`;
    });

    seekBar.addEventListener("mouseleave", () => {
        if (window.matchMedia("(hover: none)").matches) return;
        isHovering = false;
        if (!currentAudio.duration) return;
        document.querySelector('.circle').style.opacity = 0;
        seekBar.style.background =
            `linear-gradient(
            to right,
            white 0%,
            white ${progress}%,
            #555 ${progress}%,
            #555 100%
        )`;
    });

    // volume control 
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('input', (e) => {
        console.log("setting volume to: " + e.target.value + "/100");
        currentAudio.volume = e.target.value / 100;
    });

    // mute volume control
    document.querySelector('.volume').getElementsByTagName('img')[0].addEventListener('click', (e) => {
        if (currentAudio.muted) {
            currentAudio.muted = false;
            document.querySelector('.volume').getElementsByTagName('img')[0].src = "img/volume.svg";
            document.querySelector('.range').getElementsByTagName('input')[0].value = currentAudio.volume * 100;
            document.querySelector('.range').getElementsByTagName('input')[0].style.background =
                `linear-gradient(to right, white 0%, white ${currentAudio.volume * 100}%, #555 ${currentAudio.volume * 100}%, #555 100%)`;

        }
        else {
            currentAudio.muted = true;
            document.querySelector('.volume').getElementsByTagName('img')[0].src = "img/mutevolume.svg";
            document.querySelector('.range').getElementsByTagName('input')[0].value = 0;
            document.querySelector('.range').getElementsByTagName('input')[0].style.background =
                `linear-gradient(to right, white 0%, white 0%, #555 0%, #555 100%)`;

        }

    });


    let volumeBar = document.getElementById('volumeBar');
    volumeBar.addEventListener('input', (e) => {
        let val = e.target.value;
        currentAudio.volume = val / 100;

        volumeBar.style.background =
            `linear-gradient(to right, white 0%, white ${val}%, #555 ${val}%, #555 100%)`;
    });

}

main();


