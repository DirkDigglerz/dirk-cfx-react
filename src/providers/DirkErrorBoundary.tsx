"use client";

import React from "react";
import { Box, Code, Text } from "@mantine/core";

export class DirkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.group("🔥 Dirk UI Crash");
    console.error(error);
    console.error(info.componentStack);
    console.groupEnd();
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Box p="md" bg="dark.8">
        <Text c="red" fw={600}>UI crashed</Text>
        <Code block mt="sm">{this.state.error.message}</Code>
      </Box>
    );
  }
}
