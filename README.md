# NativeScript Swipe View

A NativeScript plugin to create a swipe view with actions. This is mainly to be used as items for ListView to add swipe actions for items. But can also be used in other scenarios

## Installation

Run the following command from the root of your project:

`tns plugin add nativescript-swipe-view`

This command automatically installs the necessary files, as well as stores nativescript-swipe-view as a dependency in your project's package.json file.

## Usage (Core)

```xml
<ListView items="{{ items }}">
    <ListView.itemTemplate>
        <sv:SwipeView>
            <sv:SwipeView.leftActionsTemplate>
                <StackLayout backgroundColor="blue" color="white" tap="onStar">
                    <Label text="Star"/>
                </StackLayout>
            </sv:SwipeView.leftActionsTemplate>
            <sv:SwipeView.rightActionsTemplate>
                <StackLayout backgroundColor="red" color="white" tap="onDelete">
                    <Label text="Delete" />
                </StackLayout>
            </sv:SwipeView.rightActionsTemplate>

            <GridLayout backgroundColor="white">
                <Label text="{{ value }}" verticalAlignment="center"/>
            </GridLayout>
        </sv:SwipeView>
    </ListView.itemTemplate>
</ListView>
```

## Usage in other NativeScript flavors (Angular, Vue, etc.)

Currently the plugin has not been tested nor made to support other NS flavors, since I'm not actively using those. If you are such a dev, I'm happily accepting PRs to support all the NS flavors ot there :)

## License

Apache License Version 2.0, January 2004
