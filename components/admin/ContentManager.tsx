"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ContentManager() {
    const [content, setContent] = useState({ heroTitle: "", heroSubtitle: "" });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

    useEffect(() => {
        fetch("/api/content")
            .then(res => res.json())
            .then(data => setContent(data))
            .catch(err => console.error(err));
    }, []);

    const handleSave = async () => {
        setStatus("saving");
        try {
            await fetch("/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(content)
            });
            setStatus("saved");
            setTimeout(() => setStatus("idle"), 2000);
        } catch (error) {
            console.error(error);
            setStatus("idle");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Homepage Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Hero Title</label>
                    <Input
                        value={content.heroTitle}
                        onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">HTML is supported (e.g. &lt;span class="text-primary"&gt;...&lt;/span&gt;)</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Hero Subtitle</label>
                    <Textarea
                        value={content.heroSubtitle}
                        onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                    />
                </div>
                <Button onClick={handleSave} disabled={status === "saving"}>
                    {status === "saving" ? "Saving..." : status === "saved" ? "Saved!" : "Update Content"}
                </Button>
            </CardContent>
        </Card>
    );
}
