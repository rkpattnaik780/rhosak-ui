import { userEvent } from "@storybook/testing-library";
import { composeStories } from "@storybook/testing-react";

import { render, waitForI18n } from "../../test-utils";
import * as stories from "./ManageKafkaPermissions.stories";

const { InteractiveExample } = composeStories(stories);

xdescribe("ManagePermissionsModal", () => {
  it("should render a modal with a title and a select component", async () => {
    const hideModal = jest.fn();
    const comp = render(<InteractiveExample onCancel={hideModal} />);

    await waitForI18n(comp);
    expect(await comp.findByText("Manage access")).toBeInTheDocument();
    expect(await comp.findByText("Kafka instance")).toBeInTheDocument();
    expect(await comp.findByText("name-test")).toBeInTheDocument();
    const button = await comp.findByText("Next");
    expect(button).toBeDisabled();

    userEvent.click(await comp.findByLabelText("Account"));

    expect(await comp.findByText("All accounts")).toBeInTheDocument();
    expect(await comp.findByText("Service accounts")).toBeInTheDocument();
    expect(await comp.findByText("User accounts")).toBeInTheDocument();
    expect(await comp.findByText("id2")).toBeInTheDocument();
    userEvent.click(await comp.findByText("id2"));

    expect(button).toBeEnabled();
    userEvent.click(await comp.findByLabelText("Clear all"));

    expect(button).toBeDisabled();
    expect(await comp.findByText("Required")).toBeInTheDocument();
    userEvent.type(await comp.findByLabelText("Account"), "manual-select");
    const option = await comp.findByText('Use "manual-select"');
    expect(option).toBeInTheDocument();
    userEvent.click(option);
    expect(comp.queryByText("Required")).not.toBeInTheDocument();
    userEvent.click(await comp.findByLabelText("Close"));
    expect(hideModal).toBeCalledTimes(1);
    userEvent.click(await comp.findByText("Cancel"));
    expect(hideModal).toBeCalledTimes(2);
    expect(button).toBeEnabled();
    userEvent.type(comp.getByRole("dialog"), "{esc}");
    expect(hideModal).toBeCalledTimes(3);
  });
});
