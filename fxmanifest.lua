fx_version "cerulean"
game "gta5"

description "Responsável por fazer as principais conexões entre os resources da mri Qbox"
author "MRI QBOX Team"
version "v1.1.6"

ui_page "web-side/index.html"

lua54 "yes"

shared_scripts {
	"@ox_lib/init.lua",
	"@qbx_core/modules/playerdata.lua",
	"config.lua",
	"**/**/config.lua",
	"**/**/shared/*",
}

server_scripts {
    "@oxmysql/lib/MySQL.lua",
    "**/**/server/*",
    "**/**/server-side/**/*",
}

client_scripts {
	"modules/mri/client-side/ox_lib-modules/nui_bridge.lua",
	"**/**/client/*",
	"**/**/client-side/**/*",
}

files {
	"web-side/*",
	"web-side/**/*"
}