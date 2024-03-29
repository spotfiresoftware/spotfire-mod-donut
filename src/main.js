/*
 * Copyright © 2020. TIBCO Software Inc.
 * This file is subject to the license terms contained
 * in the license file that is distributed with this file.
 */
import { render } from "./renderer";
import { createDonutState } from "./donutState";
import { resources } from "./resources";
/**
 * @typedef {{
                labelsPosition: labelsPosition,
                sortedPlacement: sortedPlacement,
                sortedPlacementOrder: sortedPlacementOrder,
                labelsVisible: labelsVisible,
                labelsPercentage: labelsPercentage,
                labelsValue: labelsValue,
                labelsCategory: labelsCategory,
                circleType: circleType
            }} modProperty
 * */
/**
 * Get access to the Spotfire Mod API by providing a callback to the initialize method.
 * @param {Spotfire.Mod} mod - mod api
 */
const Spotfire = window.Spotfire;

Spotfire.initialize(async (mod) => {
    /**
     * Create the read function.
     */
    const reader = mod.createReader(
        mod.visualization.data(),
        mod.windowSize(),
        mod.property("labelsPosition"),
        mod.property("sortedPlacement"),
        mod.property("sortedPlacementOrder"),
        mod.property("labelsVisible"),
        mod.property("labelsPercentage"),
        mod.property("labelsValue"),
        mod.property("labelsCategory"),
        mod.property("circleType"),
        mod.visualization.axis(resources.centerAxisName)
    );

    let context = mod.getRenderContext();

    /**
     * Initiate the read loop
     */
    reader.subscribe(
        async (
            dataView,
            size,
            labelsPosition,
            sortedPlacement,
            sortedPlacementOrder,
            labelsVisible,
            labelsPercentage,
            labelsValue,
            labelsCategory,
            circleType
        ) => {
            let donutState = await createDonutState(mod, dataView, size, context);
            let circleTypeChanged = reader.hasValueChanged(circleType);
            let labelsPositionChanged = reader.hasValueChanged(labelsPosition);

            mod.controls.errorOverlay.hide(resources.errorOverlayCategoryGeneral);

            if (donutState === undefined) {
                const svgsectors = document.getElementById("sectors");
                svgsectors.innerHTML = "";
                const svgoutersectors = document.getElementById("outer-sectors");
                svgoutersectors.innerHTML = "";
                const svghighlightsectorinner = document.getElementById("highlight-sector-inner");
                svghighlightsectorinner.innerHTML = "";
                const svghighlightsectorouter = document.getElementById("highlight-sector-outer");
                svghighlightsectorouter.innerHTML = "";
                const svghighlightsidelinesleft = document.getElementById("highlight-side-lines-left");
                svghighlightsidelinesleft.innerHTML = "";
                const svghighlightsidelinesright = document.getElementById("highlight-side-lines-right");
                svghighlightsidelinesright.innerHTML = "";
                const svglabels = document.getElementById("labels");
                svglabels.innerHTML = "";
                const centercolor = document.getElementById("center-color");
                centercolor.innerHTML = "";
                const centertext = document.getElementById("center-text");
                centertext.innerHTML = "";
                const centerexpression = document.getElementById("center-expression");
                centerexpression.innerHTML = "";
                return;
            }

            if (donutState == null) {
                console.error(resources.errorNullDonutState(donutState));
                mod.controls.errorOverlay.show(resources.errorGeneralOverlay, resources.errorOverlayCategoryGeneral);
                return;
            }

            if (donutState.data.length === 0) {
                console.error(resources.errorNullDonutState(donutState));
                mod.controls.errorOverlay.show(resources.errorEmptyDataOnYAxis, resources.errorOverlayCategoryGeneral);
                return;
            }

            let modProperty = {
                labelsPosition: labelsPosition,
                sortedPlacement: sortedPlacement,
                sortedPlacementOrder: sortedPlacementOrder,
                labelsVisible: labelsVisible,
                labelsPercentage: labelsPercentage,
                labelsValue: labelsValue,
                labelsCategory: labelsCategory,
                circleType: circleType
            };
            try {
                await render(donutState, modProperty, circleTypeChanged, labelsPositionChanged, context.interactive);
                context.signalRenderComplete();
            } catch (error) {
                console.error(error);
                mod.controls.errorOverlay.show(resources.errorRendering, resources.errorOverlayCategoryGeneral);
            }
        }
    );
});
