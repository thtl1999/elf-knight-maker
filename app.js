let WORD_DB
let colors = ['#730240', '#304173', '#F2CB05', '#594B04', '#0D0D0D']
let color_index = 0
const removable_chars = [' ', '·', '・', '－', '.', '「', '」', '.']
let unused_substrings = []
let minimum_length_value = 9999999
let minimum_length_substrings = []
let user_string
let substrings
let db_index
let dfs_memo
let user_lang = window.navigator.language.slice(0, 2)

const LANG = {
    'ko': {
        'title': '엘프검사 메이커',
        'lang': 0,
        'reset': '리셋',
        'search': '카드 검색',
        'example': 'DDR 준비운동 없이 엔디미온 도전하다가 왼쪽 다리 오른쪽 다리 부상 입은 엘프 검사',
        'no_word': ' 문자를 가진 카드가 없습니다',
        'no_word_first': ' 문자로 시작하는 카드가 없습니다',
        'no_word_last': ' 문자로 끝나는 카드가 없습니다'
    },
    'en': {
        'title': 'Celtic Guardian Generator',
        'lang': 1,
        'reset': 'CLEAR',
        'search': 'GENERATE',
        'example': 'DDR Endymion performed without warm-up caused Left Leg and Right Leg injured Celtic Guardian',
        'no_word': ' character cannot be found in card list',
        'no_word_first': ' character cannot be found in any card start with',
        'no_word_last': ' character cannot be found in any card end with'
    },
    'ja': {
        'title': 'エルフの剣士 ジェネレーター',
        'lang': 2,
        'reset': 'リセット',
        'search': 'GO!',
        'example': 'DDR 準備運動なしエンディミオン挑戦している中左足右足負傷したエルフの剣士',
        'no_word': ' 文字が付いているカードがありません',
        'no_word_first': ' 文字で始まるカードがありません',
        'no_word_last': ' 文字で終わるカードがありません'
    }
}

fetch('./cards.json')
    .then(response => {
        return response.json();
    })
    .then(function(word_json) {
        WORD_DB = word_json
        document.getElementById('start-button').disabled = false
    })


function change_language(lang){
    reset_all()
    document.title = LANG[lang].title
    document.getElementById('title').innerText = LANG[lang].title
    document.getElementById('reset-button').innerText = LANG[lang].reset
    document.getElementById('start-button').innerText = LANG[lang].search
    document.getElementById('user-string').value = LANG[lang].example
    document.getElementById('lang').selectedIndex = LANG[lang].lang
    user_lang = lang
}


function reset_all(){
    document.getElementById('user-string').value = ''
    reset_page()
}

function reset_page(){
    // Initialize HTML
    let p = document.getElementById('colored-text')
    p.innerText = ''
    let ol = document.getElementById('card-list')
    ol.innerHTML = ''

    // Initialize params
    unused_substrings = []
    substrings = []
    db_index = 0
    minimum_length_value = 9999999
    minimum_length_substrings = []
    dfs_memo = {}
}

function get_color(){
    color_index = (color_index + 1) % colors.length
    return colors[color_index]
}

function add_card_result(user_string){
    add_p(user_string)
    add_ol()
}

function add_p(user_string){
    let p = document.getElementById('colored-text')
    color_index = -1
    let start_index = 0
    minimum_length_substrings.forEach(substr =>{
        p.appendChild(create_color_span(substr.get_colored(user_string, start_index)))
        start_index = substr.user_end + 1
    })

}

function add_ol(){
    let ol = document.getElementById('card-list')
    color_index = -1

    minimum_length_substrings.forEach(substr =>{
        let li = document.createElement('li')
        let a = document.createElement('a')
        let [front, middle, end] = substr.get_sliced()
        let href = substr.get_url()

        a.appendChild(create_grey_span(front))
        a.appendChild(create_color_span(middle))
        a.appendChild(create_grey_span(end))
        a.href = href
        a.target = '_blank'
        li.appendChild(a)
        ol.appendChild(li)
    })
}

function create_color_span(text){
    let span = document.createElement('span')
    span.innerText = text
    span.style.color = get_color()
    return span
}

function create_grey_span(text){
    let span = document.createElement('span')
    span.innerText = text
    span.style.color = 'lightgrey'
    return span
}

class Substr{
    constructor(card_name, card_url, card_start, card_end, user_start, user_end){
        this.card_name = card_name
        this.card_url = card_url
        this.card_start = card_start
        this.card_end = card_end
        this.user_start = user_start
        this.user_end = user_end
    }

    is_contain(user_start, user_end){
        if (user_start >= this.user_start && user_end <= this.user_end)
            return true
        else
            return false
    }

    has_index(user_start){
        if (user_start >= this.user_start && user_start <= this.user_end)
            return true
        else
            return false
    }

    get_colored(user_string, start_index){
        return user_string.substring(start_index, this.user_end + 1)
    }

    get_sliced(){
        let front = this.card_name.substring(0, this.card_start)
        let middle = this.card_name.substring(this.card_start, this.card_end + 1)
        let end = this.card_name.substring(this.card_end + 1, this.card_name.length)

        return [front, middle, end]
    }

    get_url(){
        return this.card_url
    }
}

function display_impossible(user_string, problem_index){
    let problem_char = user_string[problem_index]

    let error_text = LANG[user_lang]['no_word']
    if (problem_index === 0)
        error_text = LANG[user_lang]['no_word_first']
    if (problem_index === user_string.length - 1)
        error_text = LANG[user_lang]['no_word_last']

    color_index = -1
    let p = document.getElementById('colored-text')
    p.appendChild(create_color_span(problem_char))
    p.appendChild(document.createTextNode(error_text))

}


function make_collage_start(){
    // Initialize app
    reset_page()
    document.getElementById('reset-button').disabled = true
    document.getElementById('start-button').disabled = true
    user_string = document.getElementById('user-string').value

    // Queue work
    setTimeout(get_all_substrings)

    // To prevent page reloading
    return false
}

function get_all_substrings(){
    // If not finished, queue next work
    if (db_index < WORD_DB[user_lang].length){
        setTimeout(get_all_substrings)
    }
    else{
        // If finished, display
        setTimeout(display_collage)
        delete_progress()
        return
    }

    // Without epoch, works are so slow
    let epoch = 123
    let epoch_index = 0

    while(db_index < WORD_DB[user_lang].length && epoch_index++ < epoch){
        // find substring for cards
        let card_substring_array = get_substrings(user_string, WORD_DB[user_lang][db_index++])
        for (const card_substring of card_substring_array){
            // Try add to substring in array
            add_substring(substrings, card_substring)
        }
    }
    display_progress()
}

function display_progress(){
    const p = document.getElementById('colored-text')
    p.innerText = `${db_index} / ${WORD_DB[user_lang].length}`
}

function delete_progress(){
    const p = document.getElementById('colored-text')
    p.innerText = ''
}

function display_collage(){
    // Restore buttons
    document.getElementById('reset-button').disabled = false
    document.getElementById('start-button').disabled = false

    // Check if substrings contain user string
    for(let i=0;i<user_string.length;i++){
        let is_possible = substrings.some(substr =>{
            if(substr.has_index(i))
                return true
            // If return true, go to next iteration
            // If all the iteration is true, is_possible = true
            // If return false in a iteration, is_possible = false
        })
        
        if(!is_possible){
            display_impossible(user_string, i)
            return
        }
    }

    // DFS method to find optimal
    find_minimum(substrings, [], 0)

    // Print out to HTML
    add_card_result(user_string)
}

function find_minimum(s, current_substrs, current_index){
    // Check if better seq exist
    // First, check if memo exist
    if (dfs_memo[current_index]){
        // If this is more efficient
        if (dfs_memo[current_index] > current_substrs.length){
            dfs_memo[current_index] = current_substrs.length
        }
        else {  // If better one exist
            return
        }
    }
    else {    // memo does not exist
        dfs_memo[current_index] = current_substrs.length
    }


    let substr_has_index = []
    s.forEach(substr => {
        if (substr.has_index(current_index))
            substr_has_index.push(substr)
    })

    // End of user string (empty array)
    if (!substr_has_index.length){
        // Check if this is the new minimum
        if (current_substrs.length < minimum_length_value){
            // Update minimum value
            minimum_length_value = current_substrs.length
            // Shallow copy current substring array
            minimum_length_substrings = [...current_substrs]
        }
        return
    }

    substr_has_index.forEach(substr =>{
        // Find ahead with new substr
        current_index = substr.user_end + 1
        current_substrs.push(substr)
        find_minimum(s, current_substrs, current_index)
        // Restore sequence data
        current_substrs.pop()
    })
}

function add_substring(substr_array, substr){
    for (let i = substr_array.length - 1; i >= 0; i--) {
        let s = substr_array[i]

        // If longer substring exist, exit
        if (s.is_contain(substr.user_start, substr.user_end)){
            unused_substrings.push(substr)
            return
        }

        // If shorter substring exist, delete shorter
        if (substr.is_contain(s.user_start, s.user_end)){
            substr_array.splice(i, 1)
        }
    }

    // Append substring array
    substr_array.push(substr)
}

function get_substrings(user_string, card){
    let card_name = card.N
    let substr_array = []

    for(let card_index = 0; card_index < card_name.length; card_index++){
        for (let user_index = 0; user_index < user_string.length; user_index++){
            // Do not start searching on removable char
            if (is_removable(card_name[card_index]) || is_removable(user_string[user_index]))
                continue

            let card_strlen = 0
            let user_strlen = 0

            while(card_index + card_strlen < card_name.length && user_index + user_strlen < user_string.length){
                let card_char = card_name[card_index + card_strlen]
                let user_char = user_string[user_index + user_strlen]
                
                // If next char is removable, include it
                // Also check if exceed array length
                let next_card_index = card_index + card_strlen + 1
                while(next_card_index < card_name.length && is_removable(card_name[next_card_index])){
                    card_strlen++
                    next_card_index++
                }
                let next_user_index = user_index + user_strlen + 1
                while(next_user_index < user_string.length && is_removable(user_string[next_user_index])){
                    user_strlen++
                    next_user_index++
                }

                // If found substring
                if (card_char.toLowerCase() === user_char.toLowerCase()){
                    // Check if front card
                    if (user_index == 0 && card_index != 0)
                        break

                    // Cehck if end card
                    if (user_index + user_strlen == user_string.length - 1 && card_index + card_strlen != card_name.length - 1)
                        break

                    let substr = new Substr(card_name, card.U, card_index, card_index + card_strlen, user_index, user_index + user_strlen)
                    add_substring(substr_array, substr)
                }
                else
                    break

                card_strlen++
                user_strlen++
            }
        }
    }

    return substr_array
}

function is_removable(char){
    return removable_chars.includes(char)
}

window.onload = () => {
    if (['ko','en','ja'].includes(user_lang)){
        change_language(user_lang)
    }
    else{
        change_language('en')
    }
}