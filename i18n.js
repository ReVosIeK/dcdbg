// i18n.js

const translations = {
    pl: {
        // Menu
        play: "Graj",
        main_menu: "Menu Główne",
        single_player: "Single Player",
        multiplayer: "Multiplayer",
        settings: "Ustawienia",
        language: "Język:",
        ui_scaling: "Skalowanie interfejsu:",
        back_to_menu: "Powrót",
        polish_descriptions_label: "Polskie opisy kart:",
        polish_ability_header: "Zdolność (PL)",

        // Plansza Gry i Strefy
        power_display: "Moc:",
        end_turn: "Zakończ Turę",
        main_deck_zone: "Talia Główna",
        destroyed_pile_zone: "Zniszczone",
        locations_zone: "Lokacje",
        discard_pile_zone: "Stos Odrzuconych",
        player_deck_zone: "Talia Gracza",
        line_up_zone: "Line-Up",
        kick_stack_zone: "Stos 'Kick'",
        super_villain_stack_zone: "Super-złoczyńcy",
        weakness_stack_zone: "Stos 'Weakness'",
        play_area_zone: "Strefa Gry",
        player_hand_zone: "Ręka Gracza",
        superhero_zone: "Superbohater",
        
        // Pasek menu
        debug_panel_tooltip: "Panel Debugowania",
        settings_tooltip: "Ustawienia",
        reset_game_tooltip: "Resetuj Grę",

        // Panel Debugowania
        debug_panel_title: "Panel Debugowania",
        debug_add_power: "Dodaj Moc",
        debug_remove_power: "Odejmij Moc",
        debug_draw_card: "Dobierz Kartę",
        debug_force_end_game: "Wymuś Koniec Gry",
        debug_add_to_hand: "Dodaj do Ręki",
        debug_add_to_lineup: "Dodaj do Line-Up",
        debug_destroy_card: "Zniszcz Kartę",
        debug_browse_stacks: "Przeglądaj Stosy",
        debug_browse_stacks: "Przeglądaj Stosy",
        debug_set_special: "Ustaw Karty Specjalne",
        set_sv_prompt: "Ustaw Super-złoczyńcę",
        set_sh_prompt: "Ustaw Superbohatera",

        // Modale
        are_you_sure: "Czy na pewno?",
        yes: "Tak",
        no: "Nie",
        cancel: "Anuluj",
        choose_card_title: "Wybierz kartę:",
        confirm: "Zatwierdź",
        decision_title: "Podejmij decyzję:",
        reset_game_confirm: "Czy na pewno chcesz zresetować grę?",
        
        // Dynamiczne
        add_to_hand_prompt: "Dodaj do ręki:",
        add_to_lineup_prompt: "Dodaj do Line-Up:",
        destroy_card_prompt: "Wybierz typ karty do zniszczenia:",
        bought_card_placeholder: "[ Karta Kupiona ]",
        catwoman_combo_prompt_text: "Zagrałeś Catwoman. Czy chcesz przenieść te zdobyte karty na rękę?",
        two_face_prompt: "Rzut monetą! Wybierz: Parzysty czy Nieparzysty koszt karty z wierzchu Twojej talii?",
        two_face_even: "Parzysty",
        two_face_odd: "Nieparzysty",
        two_face_correct: "Zgadłeś!",
        two_face_incorrect: "Pudło!",
        two_face_to_hand: "trafia na Twoją rękę",
        two_face_to_discard: "trafia na stos kart odrzuconych",
        riddler_initial_prompt: "Chcesz użyć specjalnej zdolności Człowieka-Zagadki (kupowanie kart za Moc) czy wolisz po prostu zyskać +1 Moc?",
        riddler_special_ability: "Użyj zdolności",
        riddler_gain_power: "+1 Moc",
        riddler_deck_empty: "Talia główna jest pusta. Nie możesz już kupować kart.",
        riddler_no_power: "Masz za mało Mocy, by kupić kolejną kartę.",
        riddler_buy_prompt_start: "Masz",
        riddler_buy_prompt_end: "Czy chcesz wydać 3 Mocy, aby zdobyć tę kartę?",
        riddler_buy_confirm: "Wydaj 3 Mocy",
        riddler_buy_cancel: "Zakończ",
    },
    en: {
        // Menu
        play: "Play",
        main_menu: "Main Menu",
        single_player: "Single Player",
        multiplayer: "Multiplayer",
        settings: "Settings",
        language: "Language:",
        ui_scaling: "UI Scaling:",
        back_to_menu: "Back",
        polish_descriptions_label: "Polish card descriptions:",
        polish_ability_header: "Ability (PL)",

        // Game Board & Zones
        power_display: "Power:",
        end_turn: "End Turn",
        main_deck_zone: "Main Deck",
        destroyed_pile_zone: "Destroyed Pile",
        locations_zone: "Locations",
        discard_pile_zone: "Discard Pile",
        player_deck_zone: "Player Deck",
        line_up_zone: "Line-Up",
        kick_stack_zone: "'Kick' Stack",
        super_villain_stack_zone: "Super-Villains",
        weakness_stack_zone: "'Weakness' Stack",
        play_area_zone: "Play Area",
        player_hand_zone: "Player Hand",
        superhero_zone: "Superhero",

        // Menu Bar
        debug_panel_tooltip: "Debug Panel",
        settings_tooltip: "Settings",
        reset_game_tooltip: "Reset Game",

        // Debug Panel
        debug_panel_title: "Debug Panel",
        debug_add_power: "Add Power",
        debug_remove_power: "Remove Power",
        debug_draw_card: "Draw Card",
        debug_force_end_game: "Force End Game",
        debug_add_to_hand: "Add to Hand",
        debug_add_to_lineup: "Add to Line-Up",
        debug_destroy_card: "Destroy Card",
        debug_browse_stacks: "Browse Stacks",
        debug_browse_stacks: "Browse Stacks",
        debug_set_special: "Set Special Cards",
        set_sv_prompt: "Set Super-Villain",
        set_sh_prompt: "Set Superhero",

        // Modals
        are_you_sure: "Are you sure?",
        yes: "Yes",
        no: "No",
        cancel: "Cancel",
        choose_card_title: "Choose a card:",
        confirm: "Confirm",
        decision_title: "Make a decision:",
        reset_game_confirm: "Are you sure you want to reset the game?",

        // Dynamic
        add_to_hand_prompt: "Add to hand:",
        add_to_lineup_prompt: "Add to Line-Up:",
        destroy_card_prompt: "Choose card type to destroy:",
        bought_card_placeholder: "[ Card Bought ]",
        catwoman_combo_prompt_text: "You played Catwoman. Do you want to move these gained cards to your hand?",
        two_face_prompt: "Coin toss! Choose: Even or Odd cost for the top card of your deck?",
        two_face_even: "Even",
        two_face_odd: "Odd",
        two_face_correct: "You guessed correctly!",
        two_face_incorrect: "You missed!",
        two_face_to_hand: "goes to your hand",
        two_face_to_discard: "goes to the discard pile",
        riddler_initial_prompt: "Do you want to use Riddler's special ability (spending Power for cards) or just gain +1 Power instead?",
        riddler_special_ability: "Use ability",
        riddler_gain_power: "+1 Power",
        riddler_deck_empty: "The main deck is empty. You cannot buy more cards.",
        riddler_no_power: "You don't have enough Power to buy another card.",
        riddler_buy_prompt_start: "You have",
        riddler_buy_prompt_end: "Do you want to spend 3 Power to gain this card?",
        riddler_buy_confirm: "Spend 3 Power",
        riddler_buy_cancel: "Stop",
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

let currentLang = 'pl';

function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Language '${lang}' not found.`);
        return;
    }
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.dataset.i18nKey;
        const translation = translations[lang][key];
        if (translation) {
            if (el.dataset.i18nTarget === 'placeholder') {
                el.textContent = translation;
            } else if (el.dataset.i18nTarget === 'title') {
                el.title = translation;
            } else {
                el.textContent = translation;
            }
        }
    });

    document.querySelectorAll('[data-i18n-zone-key]').forEach(el => {
        const key = el.dataset.i18nZoneKey;
        const translation = translations[lang][key];
        if (translation) {
            el.dataset.zoneName = translation;
        }
    });

    // --- NOWA SEKCJA: Synchronizacja list rozwijanych ---
    const langSelectMenu = document.getElementById('language-select');
    const langSelectIngame = document.getElementById('language-select-ingame');

    if (langSelectMenu) {
        langSelectMenu.value = lang;
    }
    if (langSelectIngame) {
        langSelectIngame.value = lang;
    }
}