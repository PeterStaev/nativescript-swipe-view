/* eslint-disable no-console */
import {
    EventData,
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