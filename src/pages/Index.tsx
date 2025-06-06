import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GeneratedEmail {
  subject: string;
  body: string;
}

const legiitProducts = [
  'Legiit Marketplace',
  'Legiit Dashboard',
  'Legiit Leads', 
  'Audiit.io',
  'Brand Signal'
];

const Index = () => {
  const [niche, setNiche] = useState('');
  const [product, setProduct] = useState('');
  const [emails, setEmails] = useState<GeneratedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateEmails = async () => {
    if (!niche.trim() || !product) {
      toast({
        title: "Missing Information",
        description: "Please enter a target niche and select a Legiit product.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Generating emails for niche:', niche, 'product:', product);
      
      const response = await fetch('/api/generateEmails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ niche, product }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to generate emails: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Generated data:', data);
      
      if (!data.emails || !Array.isArray(data.emails)) {
        throw new Error('Invalid response format: emails array not found');
      }
      
      setEmails(data.emails);
      
      toast({
        title: "Emails Generated!",
        description: `Created ${data.emails.length} email drafts for ${niche}.`,
      });
    } catch (error) {
      console.error('Error generating emails:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unable to generate emails. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, emailNumber: number) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `Email ${emailNumber} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  const downloadAll = () => {
    if (emails.length === 0) {
      toast({
        title: "No Emails",
        description: "Generate emails first before downloading.",
        variant: "destructive"
      });
      return;
    }

    const content = emails.map((email, index) => 
      `Email ${index + 1}:\nSubject: ${email.subject}\nBody:\n${email.body}\n\n***\n\n`
    ).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legiit-cold-emails-${niche.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: "All emails saved to your downloads folder.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 font-['Inter']">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Legiit Cold Email Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Generate high-converting cold emails using AI-powered direct response copywriting
          </p>
        </div>

        {/* Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Email Generator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-sm font-medium">
                Target Niche
              </Label>
              <Input
                id="niche"
                placeholder="e.g. dental clinics"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="border-border/50 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product" className="text-sm font-medium">
                Legiit Product
              </Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger className="border-border/50 focus:border-primary">
                  <SelectValue placeholder="Select a Legiit product" />
                </SelectTrigger>
                <SelectContent>
                  {legiitProducts.map((prod) => (
                    <SelectItem key={prod} value={prod}>
                      {prod}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateEmails}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Emails...
                </>
              ) : (
                'Generate Emails'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {emails.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Generated Emails</h2>
              <Button
                onClick={downloadAll}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>

            {emails.map((email, index) => (
              <Card key={index} className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Email {index + 1}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`Subject: ${email.subject}\n\n${email.body}`, index + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Subject:</p>
                      <p className="font-semibold text-primary">{email.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Body:</p>
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-muted/50 p-4 rounded-md">
                        {email.body}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
