/* eslint-disable no-console */
import {
    EventData,
    ItemEventData,
    ListView,
    Observable,
    ObservableArray,
    Page,
    ViewBase,
} from "@nativescript/core";


let viewModel: Observable;
export function navigatingTo(args: EventData) {
    const page = args.object as Page;
    const items = new ObservableArray();

    for (let loop = 0; loop < 200; loop++) {
        items.push({ value: "test " + loop.toString() });
    }
    viewModel = new Observable();
    viewModel.set("items", items);

    page.bindingContext = viewModel;
}

export function onStar(e: EventData) {
    console.log("STAR", (e.object as ViewBase).bindingContext);
}

export function onDelete(e: EventData) {
    console.log("DELETE", (e.object as ViewBase).bindingContext);
}

export function onItemTap(e: ItemEventData) {
    console.log(e.index);
}


export function nullifyTableViewSeparatorInsets(args: ItemEventData) {
    if (global.isIOS) {
        args.ios.separatorInset = UIEdgeInsetsZero;
        args.ios.layoutMargins = UIEdgeInsetsZero;
        args.ios.preservesSuperviewLayoutMargins = false;
    }
}

export function nullifyEmptyCells(e: EventData) {
    if (global.isIOS) {
        ((e.object as ListView).ios as UITableView).tableFooterView = UIView.alloc().initWithFrame(CGRectZero);
    }
}