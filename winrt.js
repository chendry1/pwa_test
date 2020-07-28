if (window.Windows && Windows.UI.Popups) {
    document.addEventListener('contextmenu', function (e) {

        // Build the context menu
        var menu = new Windows.UI.Popups.PopupMenu();
        menu.commands.append(new Windows.UI.Popups.UICommand("Option 1", null, 1));
        menu.commands.append(new Windows.UI.Popups.UICommandSeparator);
        menu.commands.append(new Windows.UI.Popups.UICommand("Option 2", null, 2));

        // Convert from webpage to WinRT coordinates
        function pageToWinRT(pageX, pageY) {
            var zoomFactor = document.documentElement.msContentZoomFactor;
            return {
                x: (pageX - window.pageXOffset) * zoomFactor,
                y: (pageY - window.pageYOffset) * zoomFactor
            };
        }

        // When the menu is invoked, execute the requested command
        menu.showAsync(pageToWinRT(e.pageX, e.pageY)).done(function (invokedCommand) {
            if (invokedCommand !== null) {
                switch (invokedCommand.id) {
                    case 1:
                        console.log('Option 1 selected');
                        // Invoke code for option 1
                        break;
                    case 2:
                        console.log('Option 2 selected');
                        // Invoke code for option 2
                        break;
                    default:
                        break;
                }
            } else {
                // The command is null if no command was invoked.
                console.log("Context menu dismissed");
            }
        });
    }, false);
}