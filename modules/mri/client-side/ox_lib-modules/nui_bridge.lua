local activeMenus = {}

local function getString(val)
    if type(val) == 'function' then
        return val()
    end
    return val
end

local function openNUIMenu(data)
    -- Strip functions and handle dynamic values before sending to NUI
    local nuiData = {
        id = data.id,
        title = getString(data.title),
        description = getString(data.description),
        menu = data.menu,
        options = {}
    }
    
    if data.options then
        for i, option in ipairs(data.options) do
            nuiData.options[i] = {
                title = getString(option.title),
                description = getString(option.description),
                icon = option.icon,
                arrow = option.arrow,
                menu = option.menu,
                -- onSelect is kept in Lua for the callback
            }
        end
    end

    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "openMenu",
        data = nuiData
    })
end

-- Bridge for lib.showContext
local originalShowContext = lib.showContext
function lib.showContext(id)
    local context = activeMenus[id]
    if context then
        openNUIMenu(context)
    else
        originalShowContext(id)
    end
end

-- Register context
local originalRegisterContext = lib.registerContext
function lib.registerContext(context)
    activeMenus[context.id] = context
    -- We can also call original if we want, but for now let's just keep our registry
    -- if originalRegisterContext then originalRegisterContext(context) end
end

RegisterNUICallback('closeMenu', function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('selectItem', function(data, cb)
    local menuId = data.menuId
    local isBack = data.isBack
    
    if isBack then
        lib.showContext(data.parentMenu)
        cb('ok')
        return
    end

    local itemIndex = data.itemIndex
    local context = activeMenus[menuId]

    if context and context.options and context.options[itemIndex] then
        local option = context.options[itemIndex]
        
        if option.onSelect then
            option.onSelect()
        elseif option.menu then
            lib.showContext(option.menu)
        end
    end
    
    cb('ok')
end)
