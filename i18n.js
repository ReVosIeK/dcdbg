// i18n.js

const translations = {
    pl: {
        // === MENU & USTAWIENIA ===
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
        how_to_play: "Jak chcesz grać?",
        one_superhero: "Jeden Superbohater (Standardowo)",
        two_superheroes: "Dwóch Superbohaterów (Wariant)",
        choose_two_superheroes: "Wybierz dwóch Superbohaterów:",

        // === PLANSZA GRY I STREFY ===
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

        // === PASEK MENU / TOOLTIPS ===
        debug_panel_tooltip: "Panel Debugowania",
        settings_tooltip: "Ustawienia",
        reset_game_tooltip: "Resetuj Grę",
        exit_game_confirm: "Wyjdź do Menu",
        reset_game_confirm: "Czy na pewno chcesz zresetować grę? Postęp zostanie utracony.",

        // === PANEL DEBUGOWANIA ===
        debug_panel_title: "Panel Debugowania",
        debug_add_power: "Dodaj Moc",
        debug_remove_power: "Odejmij Moc",
        debug_draw_card: "Dobierz Kartę",
        debug_force_end_game: "Wymuś Koniec Gry",
        debug_add_to_hand: "Dodaj do Ręki",
        debug_add_to_lineup: "Dodaj do Line-Up",
        debug_destroy_card: "Zniszcz Kartę",
        debug_browse_stacks: "Przeglądaj Stosy",
        debug_set_special: "Ustaw Karty Specjalne",
        set_sv_prompt: "Ustaw Super-złoczyńcę",
        set_sh_prompt: "Ustaw Superbohatera",
        debug_next_button: "Dalej",
        debug_choose_card_type_first: "Najpierw wybierz typ karty:",
        debug_choose_stack_to_browse: "Wybierz stos do przejrzenia:",
        debug_show_button: "Pokaż",
        debug_choose_special_card_to_set: "Wybierz, którą kartę specjalną chcesz ustawić:",
        debug_choose_sv_position: "Wybierz pozycję w talii Super-złoczyńców:",
        debug_sv_pos_first: "Pierwsza (na wierzchu)",
        debug_sv_pos_second: "Druga od góry",
        debug_choose_card_of_type: "Wybierz kartę typu {TYPE}:",
        debug_end_game_alert: "KONIEC GRY (debug)!\n\nTwój ostateczny wynik: {SCORE} PZ.",

        // === MODALE / POTWIERDZENIA ===
        value_label: "Wartość:",
        ok_button: "OK",
        stack_contents_title: "Zawartość:",
        empty_stack_text: "Ten stos jest pusty.",
        are_you_sure: "Czy na pewno?",
        yes: "Tak",
        no: "Nie",
        cancel: "Anuluj",
        choose_card_title: "Wybierz kartę:",
        confirm: "Zatwierdź",
        decision_title: "Podejmij decyzję:",
        exit_game_confirm: "Czy na pewno chcesz wyjść do menu głównego? Postęp w grze zostanie utracony.",
        card_pool_title: "Wspólna pula kart",
        notification_title: "Powiadomienie",
        card_revealed_title: "Odkryta Karta",
        attack_incoming_title: "Atak!",

        // === INTERAKCJE Z KARTAMI / TALIA ===
        sv_defeat_recover_card_prompt: "Pokonałeś {VILLAIN_NAME}! Odzyskujesz tę kartę. Zostaje ona umieszczona na wierzchu Twojej talii.",
        choose_card_to_place_on_top: "Wybierz kartę, którą chcesz położyć na wierzchu talii:",
        choose_X_cards_to_discard: "Wybierz {X} karty do odrzucenia:",
        confirm_move_from_discard_to_bottom: "Czy chcesz przełożyć karty ze stosu kart odrzuconych na spód swojej talii?",
        choose_up_to_X_cards_to_move: "Wybierz do {X} kart do przełożenia:",
        aquaman_trident_prompt_each_time: "Dzięki Trójzębowi Aquamana, czy chcesz użyć jego jednorazowej zdolności w tej turze, aby położyć \"{CARD_NAME}\" na wierzchu swojej talii?",
        choose_card_to_replay: "Wybierz kartę do zagrania ponownie:",
        choose_card_to_destroy: "Wybierz kartę do zniszczenia:",
        choose_X_to_destroy: "Wybierz {X} karty do zniszczenia:",
        confirm_destroy_up_to_X: "Czy chcesz zniszczyć do {X} kart z ręki lub stosu kart odrzuconych?",
        confirm_gain_kick_to_hand: "Czy chcesz wziąć kartę 'Kopniak' (Kick) na rękę?",
        choose_card_to_gain_cost_le_X: "Wybierz kartę (koszt {X} lub mniej) do zdobycia:",
        confirm_destroy_from_deck_top: "Na wierzchu twojej talii jest \"{CARD_NAME}\". Czy chcesz ją zniszczyć?",
        destroy_button: "Zniszcz",
        keep_button: "Zostaw",
        choose_card_from_lineup_to_play: "Wybierz kartę z Line-Upu do zagrania:",
        deck_is_empty_effect_cannot_be_used: "Twoja talia jest pusta. Efekt nie może zostać użyty.",
        add_to_hand_prompt: "Dodaj do ręki:",
        add_to_lineup_prompt: "Dodaj do Line-Up:",
        destroy_card_prompt: "Wybierz typ karty do zniszczenia:",
        bought_card_placeholder: "[ Karta Kupiona ]",

        // === PROMPTY BOHATERÓW / ŁOTRÓW ===
        catwoman_combo_prompt_text: "Zagrałeś Catwoman. Czy chcesz przenieść te zdobyte karty na rękę?",
        confirm_place_on_top_deck: "Czy chcesz położyć \"{CARD_NAME}\" na wierzchu swojej talii?",

        fa_is_activated: "Jego Atak z Pierwszego Pojawienia zostaje aktywowany!",
        new_sv_arrives: "Nowy Super-złoczyńca przybywa:",

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
        riddler_buy_prompt: "Masz {POWER} Mocy. Czy chcesz wydać 3 Mocy, aby zdobyć tę kartę?",
        riddler_buy_confirm: "Wydaj 3 Mocy",
        riddler_buy_cancel: "Zakończ",
        riddler_power_mismatch: "Masz {POWER} Mocy.",

        black_manta_destroy_it: "Zniszcz ją",
        black_manta_discard_hand: "Odrzuć rękę",

        brainiac_choose_cards: "Atak Brainiaca! Wybierz 2 karty z ręki, aby dodać je do wspólnej puli:",
        brainiac_cards_returned: "Karty zostały potasowane i zwrócone na Twoją rękę!",

        captain_cold_fa_text: "Atak Kapitana Chłoda! Twoi Superbohaterowie są zamrożeni. Ich zdolności nie działają, dopóki go nie pokonasz.",
        captain_cold_defeat_text: "Pokonałeś Kapitana Chłoda! Zdolności Twoich Superbohaterów znów działają.",

        darkseid_on_play_prompt: "Czy chcesz zniszczyć 2 karty z ręki, aby zyskać +5 Mocy? (Jeśli nie, zyskasz +3 Mocy)",
        darkseid_choose_2_to_destroy: "Wybierz 2 karty do zniszczenia:",
        darkseid_fa_text: "Atak Darkseida! Odrzuć 2 karty z ręki, chyba że ujawnisz z niej Łotra.",
        darkseid_reveal_prompt: "Masz w ręku Łotra! Czy chcesz go ujawnić, aby uniknąć odrzucenia 2 kart?",
        darkseid_reveal_success: "Ujawniłeś Łotra i uniknąłeś ataku!",
        darkseid_discard_all: "Masz 2 lub mniej kart. Odrzucasz całą rękę.",
        darkseid_discard_2: "Wybierz 2 karty do odrzucenia:",

        power_ring_reveal: 'Pierścień Mocy ujawnia: "{CARD_NAME}" (koszt {COST}).\nOtrzymujesz +{POWER} Mocy.',
        power_ring_deck_empty: 'Twoja talia jest pusta.\nOtrzymujesz +{POWER} Mocy.',

        bat_signal_prompt: "Wybierz Bohatera do wzięcia na rękę:",
        king_of_atlantis_prompt: "Wybierz kartę do zniszczenia (+3 Mocy) lub Anuluj (+1 Moc)",
        robin_prompt: "Wybierz Ekwipunek do wzięcia na rękę:",
        solomon_grundy_prompt: "Czy chcesz położyć \"{CARD_NAME}\" na wierzchu swojej talii?",

        choose_X_to_take_to_hand: "Wybierz {TYPE} do wzięcia na rękę:",
        card_type_hero: "Bohatera",
        card_type_equipment: "Ekwipunek",
        card_type_villain: "Łotra",
        card_type_super_power: "Supermoc",

        deathstroke_no_targets: "W Line-Upie nie ma żadnych Bohaterów ani Łotrów. Otrzymujesz +3 Mocy.",
        deathstroke_on_play_prompt: "Czy chcesz zdobyć Bohatera lub Łotra z Line-Upu? (Jeśli nie, otrzymasz +3 Mocy)",
        deathstroke_choose_card_to_gain: "Wybierz Bohatera lub Łotra do zdobycia:",
        deathstroke_fa_no_targets: "Atak Deathstroke'a! Nie masz w ręce ani na stosie odrzuconych żadnych Bohaterów, Supermocy ani Ekwipunków do zniszczenia.",
        deathstroke_fa_reveal_hand: "Atak Deathstroke'a! Ujawnij swoją rękę. Musisz zniszczyć jednego Bohatera, Supermoc lub Ekwipunek.",
        deathstroke_fa_must_destroy: "Wybierz kartę do zniszczenia (obowiązkowe):",

        sinestro_reveal_hero: "Sinestro ujawnia Bohatera: \"{CARD_NAME}\". Otrzymujesz +3 Mocy, a karta zostaje zniszczona.",
        sinestro_reveal_other: "Sinestro ujawnia: \"{CARD_NAME}\". Karta zostaje dodana do Twojej ręki.",
        sinestro_fa_reveal_hand: "Atak Sinestro! Ujawnij swoją rękę. Musisz odrzucić jedną kartę za każdego Bohatera, którego posiadasz.",
        sinestro_fa_no_heroes: "Nie masz żadnych Bohaterów na ręce. Atak Sinestro nie ma efektu.",
        sinestro_fa_discard_X: "Masz {X} Bohaterów na ręce. Wybierz {X} karty do odrzucenia:",

        parallax_fa_reveal_hand: "Atak Parallaxa! Ujawnij swoją rękę. Odrzucasz wszystkie karty o koszcie 2 lub mniejszym.",
        parallax_fa_no_targets: "Nie masz na ręce żadnych kart o koszcie 2 lub mniejszym.",
        parallax_fa_discarded: "Atak Parallaxa! Odrzucasz następujące karty z ręki:",

        joker_fa_solo_effect: "Atak Jokera! W grze solo nie masz komu przekazać karty. Atak nie ma efektu.",

        anti_monitor_no_cards_to_destroy: "Line-Up jest pusty. Nie ma kart do zniszczenia.",
        anti_monitor_choose_to_destroy: "Wybierz karty z Banku Kart, które chcesz zniszczyć:",
        anti_monitor_fa_no_cards: "Atak Anti-Monitora! Nie masz na ręce żadnych kart o koszcie 1 lub większym.",
        anti_monitor_fa_reveal_hand: "Atak Anti-Monitora! Ujawnij swoją rękę. Musisz wybrać jedną kartę (koszt 1+), aby dodać ją do Banku Kart.",
        anti_monitor_fa_choose_card: "Wybierz kartę, którą chcesz dodać do Banku Kart",
        anti_monitor_fa_no_space: "W Banku KArt nie ma wolnego miejsca! Twoja karta pozostaje na ręce.",

        lex_luthor_fa_no_villains: "Atak Lexa Luthora! W Banku Kart nie ma żadnych Łotrów. Atak nie ma efektu.",
        lex_luthor_fa_gain_weakness: "Atak Lexa Luthora! Otrzymujesz {X} karty Słabości, po jednej za każdego Łotra w Banku Kart.",

    },
    en: {
        // === MAIN MENU & SETTINGS ===
        play: "Play",
        main_menu: "Main Menu",
        single_player: "Single Player",
        multiplayer: "Multiplayer",
        settings: "Settings",
        language: "Language:",
        ui_scaling: "UI Scaling:",
        back_to_menu: "Back",
        polish_descriptions_label: "(PC Only) Polish card descriptions:",
        polish_ability_header: "Ability (PL)",
        how_to_play: "How do you want to play?",
        one_superhero: "One Superhero (Standard)",
        two_superheroes: "Two Superheroes (Variant)",
        choose_two_superheroes: "Choose two Superheroes:",

        // === GAMEPLAY UI ===
        power_display: "Power:",
        end_turn: "End Turn",

        // === ZONES ===
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

        // === TOOLBAR / TOOLTIPS ===
        debug_panel_tooltip: "Debug Panel",
        settings_tooltip: "Settings",
        reset_game_tooltip: "Reset Game",
        exit_game_tooltip: "Exit to Menu",

        // === DEBUG PANEL ===
        debug_panel_title: "Debug Panel",
        debug_add_power: "Add Power",
        debug_remove_power: "Remove Power",
        debug_draw_card: "Draw Card",
        debug_force_end_game: "Force End Game",
        debug_add_to_hand: "Add to Hand",
        debug_add_to_lineup: "Add to Line-Up",
        debug_destroy_card: "Destroy Card",
        debug_browse_stacks: "Browse Stacks",
        debug_set_special: "Set Special Cards",
        debug_next_button: "Next",
        debug_choose_card_type_first: "First, choose a card type:",
        debug_choose_stack_to_browse: "Choose a stack to browse:",
        debug_show_button: "Show",
        debug_choose_special_card_to_set: "Choose which special card you want to set:",
        debug_choose_sv_position: "Choose position in the Super-Villain stack:",
        debug_sv_pos_first: "First (on top)",
        debug_sv_pos_second: "Second from top",
        debug_choose_card_of_type: "Choose a card of type {TYPE}:",
        debug_end_game_alert: "GAME OVER (debug)!\n\nYour final score: {SCORE} VP.",

        // === GENERIC DIALOGS & BUTTONS ===
        value_label: "Value:",
        ok_button: "OK",
        stack_contents_title: "Contents:",
        empty_stack_text: "This stack is empty.",
        set_sv_prompt: "Set Super-Villain",
        set_sh_prompt: "Set Superhero",
        are_you_sure: "Are you sure?",
        yes: "Yes",
        no: "No",
        cancel: "Cancel",
        confirm: "Confirm",
        choose_card_title: "Choose a card:",
        decision_title: "Make a decision:",
        reset_game_confirm: "Are you sure you want to reset the game? All progress will be lost.",
        exit_game_confirm: "Are you sure you want to exit to the main menu? Your game progress will be lost.",
        enter_value_title: "Enter value",
        card_pool_title: "Common Card Pool",
        notification_title: "Notification",
        card_revealed_title: "Card Revealed",
        attack_incoming_title: "Attack!",

        // === CARD / DECK INTERACTIONS ===
        sv_defeat_recover_card_prompt: "You defeated {VILLAIN_NAME}! You recover this card. It is placed on top of your deck.",
        choose_card_to_place_on_top: "Choose a card to place on top of your deck:",
        choose_X_cards_to_discard: "Choose {X} cards to discard:",
        confirm_move_from_discard_to_bottom: "Do you want to move cards from your discard pile to the bottom of your deck?",
        choose_up_to_X_cards_to_move: "Choose up to {X} cards to move:",
        aquaman_trident_prompt_each_time: "Thanks to Aquaman's Trident, do you want to use its once-per-turn ability to place \"{CARD_NAME}\" on top of your deck?",
        choose_card_to_replay: "Choose a card to play again:",
        choose_card_to_destroy: "Choose a card to destroy:",
        choose_X_to_destroy: "Choose {X} cards to destroy:",
        confirm_destroy_up_to_X: "Do you want to destroy up to {X} cards from your hand or discard pile?",
        confirm_gain_kick_to_hand: "Do you want to gain a 'Kick' card to your hand?",
        choose_card_to_gain_cost_le_X: "Choose a card (cost {X} or less) to gain:",
        confirm_destroy_from_deck_top: "The top card of your deck is \"{CARD_NAME}\". Do you want to destroy it?",
        destroy_button: "Destroy",
        keep_button: "Keep",
        choose_card_from_lineup_to_play: "Choose a card from the Line-Up to play:",
        deck_is_empty_effect_cannot_be_used: "Your deck is empty. The effect cannot be used.",
        add_to_hand_prompt: "Add to hand:",
        add_to_lineup_prompt: "Add to Line-Up:",
        destroy_card_prompt: "Choose card type to destroy:",
        bought_card_placeholder: "[ Card Bought ]",

        // === HERO / VILLAIN PROMPTS ===
        
        catwoman_combo_prompt_text: "You played Catwoman. Do you want to move these gained cards to your hand?",
        confirm_place_on_top_deck: "Do you want to place \"{CARD_NAME}\" on top of your deck?",


        fa_is_activated: "His First Appearance - Attack is activated!",
        new_sv_arrives: "A new Super-Villain arrives:",

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
        riddler_buy_prompt: "You have {POWER} Power. Do you want to spend 3 Power to gain this card?",
        riddler_buy_confirm: "Spend 3 Power",
        riddler_buy_cancel: "Stop",
        riddler_power_mismatch: "You have {POWER} Power.",

        black_manta_destroy_it: "Destroy it",
        black_manta_discard_hand: "Discard your hand",

        brainiac_choose_cards: "Brainiac's Attack! Choose 2 cards from your hand to add to the card pool:",
        brainiac_cards_returned: "The cards have been shuffled and returned to your hand!",

        captain_cold_fa_text: "Captain Cold's Attack! Your Super Heroes are frozen. Their abilities are disabled until you defeat him.",
        captain_cold_defeat_text: "You defeated Captain Cold! Your Super Hero abilities are active again.",

        darkseid_on_play_prompt: "Do you want to destroy 2 cards from your hand to gain +5 Power? (Otherwise you gain +3 Power)",
        darkseid_choose_2_to_destroy: "Choose 2 cards to destroy:",
        darkseid_fa_text: "Darkseid's Attack! Discard 2 cards from your hand, unless you reveal a Villain from it.",
        darkseid_reveal_prompt: "You have a Villain in your hand! Do you want to reveal it to avoid discarding 2 cards?",
        darkseid_reveal_success: "You revealed a Villain and avoided the attack!",
        darkseid_discard_all: "You have 2 or fewer cards. You discard your entire hand.",
        darkseid_discard_2: "Choose 2 cards to discard:",

        bat_signal_prompt: "Choose a Hero to take into your hand:",
        king_of_atlantis_prompt: "Choose a card to destroy (+3 Power) or Cancel (+1 Power)",
        robin_prompt: "Choose an Equipment to take into your hand:",
        solomon_grundy_prompt: "Do you want to place \"{CARD_NAME}\" on top of your deck?",

        power_ring_reveal: "Power Ring reveals: \"{CARD_NAME}\" (cost {COST}).\nYou gain +{POWER} Power.",
        power_ring_deck_empty: "Your deck is empty.\nYou gain +{POWER} Power.",

        choose_X_to_take_to_hand: "Choose a {TYPE} to take into your hand:",
        card_type_hero: "Hero",
        card_type_equipment: "Equipment",
        card_type_villain: "Villain",
        card_type_super_power: "Super Power",

        deathstroke_no_targets: "There are no Heroes or Villains in the Line-Up. You gain +3 Power instead.",
        deathstroke_on_play_prompt: "Do you want to gain a Hero or Villain from the Line-Up? (If not, you gain +3 Power)",
        deathstroke_choose_card_to_gain: "Choose a Hero or Villain to gain:",
        deathstroke_fa_no_targets: "Deathstroke's Attack! You have no Heroes, Super Powers, or Equipment in your hand or discard pile to destroy.",
        deathstroke_fa_reveal_hand: "Deathstroke's Attack! Reveal your hand. You must destroy a Hero, Super Power, or Equipment.",
        deathstroke_fa_must_destroy: "Choose a card to destroy (mandatory):",

        sinestro_reveal_hero: "Sinestro reveals a Hero: \"{CARD_NAME}\". You gain +3 Power and the card is destroyed.",
        sinestro_reveal_other: "Sinestro reveals: \"{CARD_NAME}\". The card is added to your hand.",
        sinestro_fa_reveal_hand: "Sinestro's Attack! Reveal your hand. You must discard one card for each Hero you have.",
        sinestro_fa_no_heroes: "You have no Heroes in your hand. Sinestro's Attack has no effect.",
        sinestro_fa_discard_X: "You have {X} Heroes in your hand. Choose {X} cards to discard:",

        parallax_fa_reveal_hand: "Parallax's Attack! Reveal your hand. You discard all cards with a cost of 2 or less.",
        parallax_fa_no_targets: "You have no cards in your hand with a cost of 2 or less.",
        parallax_fa_discarded: "Parallax's Attack! You discard the following cards from your hand:",

        joker_fa_solo_effect: "Joker's Attack! In solo mode, you have no one to pass a card to. The attack has no effect.",

        anti_monitor_no_cards_to_destroy: "The Line-Up is empty. There are no cards to destroy.",
        anti_monitor_choose_to_destroy: "Choose cards from the Line-Up to destroy:",
        anti_monitor_fa_no_cards: "Anti-Monitor's Attack! You have no cards in your hand with a cost of 1 or greater.",
        anti_monitor_fa_reveal_hand: "Anti-Monitor's Attack! Reveal your hand. You must choose one card (cost 1+) to add to the Line-Up.",
        anti_monitor_fa_choose_card: "Choose a card to add to the Line-Up:",
        anti_monitor_fa_no_space: "There is no empty space in the Line-Up! Your card remains in your hand.",

        lex_luthor_fa_no_villains: "Lex Luthor's Attack! There are no Villains in the Line-Up. The attack has no effect.",
        lex_luthor_fa_gain_weakness: "Lex Luthor's Attack! You gain {X} Weakness card(s), one for each Villain in the Line-Up.",
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