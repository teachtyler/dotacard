game.player = {
  placeHeroes: function () {
    game.player.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player').appendTo(game.states.table.player).hide();
        if (game.mode == 'library') {
          var card = deck.data('cards')[0];
          card.addClass('player').on('mousedown touchstart', game.card.select);
          card.place(game.map.toPosition(4, 4));
          card.on('action', game.library.action).on('death', game.library.action);
        } else {
          var x = 1, y = 4;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player').on('mousedown touchstart', game.card.select);
            card.place(game.map.toPosition(x + p, y));
            if (game.mode == 'online') card.on('action', game.online.action);
            if (game.mode == 'tutorial') card.on('select', game.tutorial.selected);
          });
        }
      }
    });
  },
  buyCard: function () {
    var availableSkills = $('.table .player .available .card'),
      card,
      heroid,
      hero,
      to,
      skillid;
    if (availableSkills.length < game.player.cardsPerTurn) {
      $('.table .player .cemitery .card').appendTo(game.player.skills.deck);
      availableSkills = $('.table .player .available .card');
    }
    card = availableSkills.randomCard();
    if (card.data('hand') === game.data.ui.right) {
      card.appendTo(game.player.skills.hand);
    } else {
      card.appendTo(game.player.skills.sidehand);
    }
  },
  buyCards: function (n) {
    for (var i=0; i<n; i++) {
      if (game.player.skills.hand.children().length < game.player.maxCards) {
        game.player.buyCard();
      }
    }
  },
  buyHand: function () {
    if (game.player.turn > 1) {
      for (var i = 0; i < game.player.cardsPerTurn; i += 1) {
        if (game.player.skills.hand.children().length < game.player.maxCards) {
          game.player.buyCard();
        }
      }
    }
  },
  move: function (event) {
    var spot = $(this),
      card = game.selectedCard,
      from = card.getPosition(),
      to = spot.getPosition();
    if (game.isPlayerTurn() &&
        spot.hasClass('free') &&
        from !== to &&
        !card.hasClass('done')) {
      card.move(to);
      card.removeClass('draggable').addClass('done');
      if (game.mode == 'online') game.currentMoves.push('M:' + from + ':' + to);
    }
  },
  attack: function (event) {
    var target = $(this),
      source = game.selectedCard,
      from = source.getPosition(),
      to = target.getPosition();
    if (game.isPlayerTurn() &&
        source.data('damage') && 
        from !== to && 
        !source.hasClass('done') && 
        target.data('current hp')) {
      source.attack(target);
      source.addClass('done').removeClass('draggable');
      if (game.mode == 'online') game.currentMoves.push('A:' + from + ':' + to);
      game.highlight.clearMap();
    }
  },
  passive: function (event) {
    var target = $(this),
      skill = game.selectedCard,
      hero = skill.data('hero'),
      skillid = skill.data('skill'),
      to = target.getPosition();
    if (game.isPlayerTurn() && hero && skillid) {
      skill.passive(target);
      game.currentMoves.push('P:' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, target, event);
    }
  },
  toggle: function (event) {
    var target = $(this),
      skill = game.selectedCard,
      hero = skill.data('hero'),
      skillid = skill.data('skill'),
      to = target.getPosition();
    if (game.isPlayerTurn() && hero && skillid) {
      skill.toggle(target);
      game.currentMoves.push('T:' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, target, event);
    }
  },
  cast: function (event) {
    var target = $(this),
      skill = game.selectedCard,
      source = $('.map .source'),
      from = source.getPosition(),
      to = target.getPosition(),
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (game.isPlayerTurn() &&
        hero && skillid && from && to &&
        !source.hasClass('done')) {
      source.cast(skill, to);
      if (skill.data('type') !== game.data.ui.instant) {
        source.addClass('done').removeClass('draggable');
      }
      game.currentMoves.push('C:' + from + ':' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, to, event);
    }
  },
  discard: function (skill) {
    var hero = skill.data('hero'),
        skillid = skill.data('skill');
    game.currentMoves.push('D:' + skillid + ':' + hero);
    game.states.table.discard.attr('disabled', true);
    skill.addClass('slidedown');
    game.timeout(300, function () {
      skill.discard();
    });
  },
  cardsInHand: function () {
    return game.player.skills.hand.children().length;
  },
  maxSkillCards: function () {
    return game.player.maxCards;
  }
};
