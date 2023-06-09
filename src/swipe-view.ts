/* eslint-disable no-underscore-dangle */
/* ! *****************************************************************************
Copyright (c) 2023 Tangra Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */
import {
    Builder,
    CoreTypes,
    EventData,
    GestureStateTypes,
    GridLayout,
    ItemSpec,
    PanGestureEventData,
    Property,
    Template,
    Utils,
    View,
} from "@nativescript/core";

import * as definition from "./swipe-view";

Builder.knownTemplates.add("leftActionsTemplate").add("rightActionsTemplate");

const leftActionsTemplateProperty = new Property({
    name: "leftActionsTemplate",
    affectsLayout: true,
    valueChanged: (target: SwipeView, oldValue, newValue) => {
        target.refresh();
    },
});
const rightActionsTemplateProperty = new Property({
    name: "rightActionsTemplate",
    affectsLayout: true,
    valueChanged: (target: SwipeView, oldValue, newValue) => {
        target.refresh();
    },
});

export class SwipeView extends GridLayout implements definition.SwipeView {
    public static swipeViewSwipeStartedEvent = "swipeViewSwipeStarted";

    public leftActionsTemplate: Template;
    public rightActionsTemplate: Template;

    private _swipeView: GridLayout;
    private _leftActionsTemplateView: View;
    private _rightActionsTemplateView: View;
    private _previousDelta = 0;
    private _isParentPanIn = false;
    private _animationDuration = 250;

    public refresh() {
        if (!this._swipeView) {
            this._swipeView = new GridLayout();
            this._swipeView.addColumn(new ItemSpec(1, "auto"));
            this._swipeView.addColumn(new ItemSpec(1, "star"));
            this._swipeView.addColumn(new ItemSpec(1, "auto"));
            this.insertChild(this._swipeView, 0);
        }

        this._swipeView.removeChildren();

        if (this.leftActionsTemplate) {
            this._leftActionsTemplateView = this.leftActionsTemplate();
            this._swipeView.addChildAtCell(this._leftActionsTemplateView, 0, 0);
        }

        if (this.rightActionsTemplate) {
            this._rightActionsTemplateView = this.rightActionsTemplate();
            this._swipeView.addChildAtCell(this._rightActionsTemplateView, 0, 2);
        }

    }

    public onLoaded() {
        super.onLoaded();

        this.style.padding = 0;

        this.parent?.on("pan", this._onParentPan, this);
        this.parent?.on(SwipeView.swipeViewSwipeStartedEvent, this._onSwipeViewSwipeStarted, this);
        this.parent?.on("itemTap", this._resetTransition, this);

        this.on("pan", this._onPan, this);
        this._swipeView.on("tap", this._resetTransition, this);
    }

    public onUnloaded(): void {
        this.parent?.off("pan", this._onParentPan, this);
        this.parent?.off(SwipeView.swipeViewSwipeStartedEvent, this._onSwipeViewSwipeStarted, this);
        this.parent?.off("itemTap", this._resetTransition, this);

        this.off("pan", this._onPan, this);
        this._swipeView.off("tap", this._resetTransition, this);

        this.removeChild(this._swipeView);
        this._swipeView.removeChildren();
        this._swipeView = undefined;
        this._leftActionsTemplateView = undefined;
        this._rightActionsTemplateView = undefined;

        super.onUnloaded();
    }

    private _resetTransition() {
        this.getChildAt(1)?.animate({
            translate: { x: 0, y: 0 },
            duration: this._animationDuration,
            curve: CoreTypes.AnimationCurve.easeIn,
        });
    }

    private _onPan(e: PanGestureEventData) {
        if (this._isParentPanIn) {
            return;
        }

        // Pan start
        if (e.state === GestureStateTypes.began) {
            this.parent?.notify({
                eventName: SwipeView.swipeViewSwipeStartedEvent,
                object: this,
            });

            // Set the height of the swipe view to the max from all. Otherwise it is not resized correctly.
            const itemViewHeight = this.getChildAt(1)?.getMeasuredHeight();
            const leftActionsHeight = this._leftActionsTemplateView?.getMeasuredHeight();
            const rightActionsHeight = this._rightActionsTemplateView?.getMeasuredHeight();
            const finalHeight = Math.max(
                itemViewHeight || 0,
                leftActionsHeight || 0,
                rightActionsHeight || 0,
            );
            this._swipeView.height = Utils.layout.toDeviceIndependentPixels(finalHeight);
        }

        const itemView = this.getChildAt(1);
        const leftActionsViewMeasuredWidth = Utils.layout.toDeviceIndependentPixels(this._leftActionsTemplateView?.getMeasuredWidth());
        const rightActionsViewMeasuredWidth = Utils.layout.toDeviceIndependentPixels(this._rightActionsTemplateView?.getMeasuredWidth());

        // Pan Stop
        if (e.state === GestureStateTypes.ended) {
            let translateX = 0;
            if (e.deltaX < 0 && itemView.translateX < 0) {
                translateX = -rightActionsViewMeasuredWidth;
            }
            else if (e.deltaX > 0 && itemView.translateX > 0) {
                translateX = leftActionsViewMeasuredWidth;
            }

            itemView.animate({
                translate: { x: translateX, y: 0 },
                duration: this._animationDuration,
                curve: CoreTypes.AnimationCurve.easeIn,
            });

            this._previousDelta = 0;
            return;
        }

        if (this._rightActionsTemplateView) {
            if (e.deltaX < 0
                && Math.abs(e.deltaX) <= rightActionsViewMeasuredWidth
                && itemView.translateX <= 0) {
                itemView.translateX = e.deltaX;
            }
            else if (e.deltaX > 0
                && itemView.translateX < 0) {
                itemView.translateX += e.deltaX - this._previousDelta;
                this._previousDelta = e.deltaX;
            }
        }

        if (this._leftActionsTemplateView) {
            if (e.deltaX > 0
                && e.deltaX <= leftActionsViewMeasuredWidth
                && itemView.translateX >= 0) {
                itemView.translateX = e.deltaX;
            }
            else if (e.deltaX < 0
                && itemView.translateX > 0) {
                itemView.translateX += e.deltaX - this._previousDelta;
                this._previousDelta = e.deltaX;
            }
        }
    }

    private _onParentPan(e: PanGestureEventData) {
        this._isParentPanIn = e.state === GestureStateTypes.changed && Math.abs(e.deltaY) > 5;
        if (this._isParentPanIn
            && this.getChildAt(1)?.translateX !== 0) {
            this._resetTransition();
        }
    }

    private _onSwipeViewSwipeStarted(e: EventData) {
        if (e.object !== this) {
            this._resetTransition();
        }
    }
}

leftActionsTemplateProperty.register(SwipeView);
rightActionsTemplateProperty.register(SwipeView);