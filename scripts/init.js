let socket;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("automatic-actor-creator");
  socket.register("autoCreateActor", autoCreateActor);
});

Hooks.on("ready", async () => {
  if (game.user.isGM) {
    return;
  }

  if (game.actors.filter(a => a.data.permission[game.user.id] === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER).length) {
    // User already owns a token
    return;
  }

  const result = await socket.executeAsGM("autoCreateActor", game.user);
  if (result?.length) {
    new UserConfig(game.user).render(true);
    ui.notifications.info(`Actor "${game.user.name}" automatically created. You may now edit your character.`, {permanent: true});
    const actor = game.actors.find(a => a.data.permission[game.user.id] === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER);
    if (actor) {
      actor.sheet.render(true);
    }
  }
});


function autoCreateActor(user) {
  const userId = user._id;
  if (game.actors.filter(a => a.data.permission[userId] === CONST.DOCUMENT_PERMISSION_LEVELS.OWNER).length) {
    // User already owns a token
    return;
  }
  console.log(`Creating actor for: ${user.name} (${userId})`);
  const permission = {};
  permission[userId] = CONST.DOCUMENT_PERMISSION_LEVELS.OWNER;
  return Actor.createDocuments([{name: user.name, type: 'character', permission}]);
}