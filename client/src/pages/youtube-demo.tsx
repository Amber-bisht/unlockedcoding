import React, { useState } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseBulkYouTubeLinks, validateYouTubeLink, isYouTubeVideo, isYouTubePlaylist } from '@/lib/youtube-utils';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Youtube, Play, List } from 'lucide-react';

export default function YouTubeDemoPage() {
  const [inputText, setInputText] = useState('');
  const [parsedLinks, setParsedLinks] = useState<{ title: string; url: string }[]>([]);
  const { toast } = useToast();

  const sampleData = `Javascript for beginners | chai aur #javascript:https://www.youtube.com/watch?v=Hr5iLG7sUa0
Setting up environment in local machine for Javascript | chai aur #javascript:https://www.youtube.com/watch?v=cvoLc3deAdQ
Save and work on Github for Javascript | chai aur #javascript:https://www.youtube.com/watch?v=-GoKoR6aLcY
Let, const and var ki kahani | chai aur #javascript:https://www.youtube.com/watch?v=yY0bKZNYmJs
Datatypes and ECMA standards | chai aur #javascript:https://www.youtube.com/watch?v=-9knnv97wSc
Datatype conversion confusion | chai aur #javascript:https://www.youtube.com/watch?v=X7hDBhd_L5U
Why string to number conversion is confusing | chai aur #javascript:https://www.youtube.com/watch?v=N9el4APFtAo
Comparison of datatypes in javascript | chai aur #javascript:https://www.youtube.com/watch?v=giP2uXMlv4c
Data types of javascript summary | chai aur #javascript:https://www.youtube.com/watch?v=suMvZWjjKbo
Stack and Heap memory in javascript:https://www.youtube.com/watch?v=7gwc-1czolw
Strings in Javascript | chai aur #javascript:https://www.youtube.com/watch?v=fozwNnFunlo
Number and Maths in Javascript | chai aur #javascript:https://www.youtube.com/watch?v=_KqpeDc47Ro
Date and time in depth in javascript | chair aur #javascript:https://www.youtube.com/watch?v=tGLCuoumaGY
Array in Javascript | chai aur #javascript:https://www.youtube.com/watch?v=cejBux2gtEE
Array part 2 in Javascript Hindi | chai aur #javascript:https://www.youtube.com/watch?v=m6azhgyCi-k
Objects in depth in javascript in hindi | chai aur #javascript:https://www.youtube.com/watch?v=vVYOHmqQDCU
Objects in Javascript part 2 in Hindi | chai aur #javascript:https://www.youtube.com/watch?v=4lb2pXWWXJI
Object de-structure and JSON API intro | chai aur #javascript:https://www.youtube.com/watch?v=AViTh83k-IE
Functions and parameter in javascript | Hindi:https://www.youtube.com/watch?v=Bn56WahG_t0
Functions with objects and array in javascript | chai aur #javascript:https://www.youtube.com/watch?v=t7ZHPhgdA4U
Global and local scope in javascript | chai aur #javascript:https://www.youtube.com/watch?v=cHHU0jXfjKY
Scope level and mini hoisting in javascript | chai aur #javascript:https://www.youtube.com/watch?v=eWwge2YpHhc
THIS and arrow function in javascript | chai aur #javascript:https://www.youtube.com/watch?v=9ksqBa8_txM
Immediately Invoked Function Expressions IIFE | chai aur #javascript:https://www.youtube.com/watch?v=GAIbn16Iytc
How does javascript execute code + call stack | chai aur #javascript:https://www.youtube.com/watch?v=ByhtOgF6uYM
Control flow in javascript in 1 shot | chai aur #javascript:https://www.youtube.com/watch?v=0P_YvC6Gg0c
For loop with break and continue in javascript | chai aur #javascript:https://www.youtube.com/watch?v=Y1cpFsXrEgY
While and do while loop in Javascript | chai aur #javascript:https://www.youtube.com/watch?v=w3Q55-l47P0
High Order Array loops | chai aur #javascript:https://www.youtube.com/watch?v=M0YImBHQsWU
Filter map and reduce in javascript | chai aur #javascript:https://www.youtube.com/watch?v=9MfwYoWKKVE
DOM introduction in javascript | chai aur #javascript:https://www.youtube.com/watch?v=DcjNkHtDj8A
All DOM selectors NodeList and HTMLCollection | chai aur #javascript:https://www.youtube.com/watch?v=Ab6K57WjWTE
How to create a new element in DOM | chai aur #javascript:https://www.youtube.com/watch?v=xAvTgCsCHLs
Edit and remove elements in DOM | chai aur #javascript:https://www.youtube.com/watch?v=VQlY-X_eeTE
Lets build 4 javascript projects for beginners | chai aur #javascript:https://www.youtube.com/watch?v=EGqHVjU-fas
Events in Javascript | chai aur #javascript:https://www.youtube.com/watch?v=_ALUMTa8BAE
Async Javascript fundamentals | chai aur #javascript:https://www.youtube.com/watch?v=zgt5oTD3rRc
2 projects with Async JS | chai aur #javascript:https://www.youtube.com/watch?v=efrW5-IYoCU
API request and V8 engine | chai aur #javascript:https://www.youtube.com/watch?v=pDPAcYdSse8
Promise in javascript | chai aur #javascript:https://www.youtube.com/watch?v=NJwRQgsu1Q8
Now you know fetch in javascript | chai aur #javascript:https://www.youtube.com/watch?v=Rive84an6Lc
Object Oriented in Javascript | chai aur #javascript:https://www.youtube.com/watch?v=pN-Qmv4zBcI
Magic of Prototype in javascript | chai aur #javascript:https://www.youtube.com/watch?v=uMI5cNeHTOc
Call and this in javascript | chai aur #javascript:https://www.youtube.com/watch?v=-owpuf4lbyU
Class constructor and static | chai aur #javascript:https://www.youtube.com/watch?v=u6mVHkMpoMk
Bind in javascript | chai aur #javascript:https://www.youtube.com/watch?v=75dMiOY_4ac
Now you know Objects in Javascript | chai aur #javascript:https://www.youtube.com/watch?v=jss2rL9kv6s
Getter Setter and Stack Overflow | chai aur #javascript:https://www.youtube.com/watch?v=t6vLhF-iSxQ
Lexical scoping and Closure | chai aur #javascript:https://www.youtube.com/watch?v=VaH09NXQZ58
Javascript ends with a story | chai aur #javascript:https://www.youtube.com/watch?v=z9PINyinqwo`;

  const handleParse = () => {
    try {
      const parsed = parseBulkYouTubeLinks(inputText);
      setParsedLinks(parsed);
      
      const validCount = parsed.filter(link => validateYouTubeLink(link)).length;
      const invalidCount = parsed.length - validCount;
      
      toast({
        title: "Parsing Complete",
        description: `Parsed ${parsed.length} links (${validCount} valid YouTube URLs, ${invalidCount} invalid)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse the input text",
        variant: "destructive",
      });
    }
  };

  const handleLoadSample = () => {
    setInputText(sampleData);
  };

  const handleClear = () => {
    setInputText('');
    setParsedLinks([]);
  };

  const handleTestParsing = () => {
    const testData = `Why string to number conversion is confusing | chai aur #javascript:https://www.youtube.com/watch?v=N9el4APFtAo
Javascript for beginners | chai aur #javascript:https://www.youtube.com/watch?v=Hr5iLG7sUa0
Setting up environment in local machine for Javascript | chai aur #javascript:https://www.youtube.com/watch?v=cvoLc3deAdQ`;
    
    setInputText(testData);
    const parsed = parseBulkYouTubeLinks(testData);
    setParsedLinks(parsed);
    
    toast({
      title: "Test Parsing Complete",
      description: `Parsed ${parsed.length} test links`,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      
      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">YouTube Link Parser Demo</h1>
            <p className="text-muted-foreground">
              Test the custom YouTube link parsing format: "Title:URL"
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    Input Format
                  </CardTitle>
                  <CardDescription>
                    Enter YouTube links in the format: "Title:URL" (one per line)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your YouTube links here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-64 font-mono text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <Button onClick={handleParse} disabled={!inputText.trim()}>
                      <Play className="h-4 w-4 mr-2" />
                      Parse Links
                    </Button>
                    <Button variant="outline" onClick={handleLoadSample}>
                      Load Sample
                    </Button>
                    <Button variant="outline" onClick={handleClear}>
                      Clear
                    </Button>
                    <Button variant="outline" onClick={handleTestParsing}>
                      Test Parsing
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5" />
                    Parsed Results
                  </CardTitle>
                  <CardDescription>
                    {parsedLinks.length > 0 
                      ? `${parsedLinks.length} links parsed` 
                      : "No links parsed yet"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {parsedLinks.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {parsedLinks.map((link, index) => {
                        const isValid = validateYouTubeLink(link);
                        const isVideo = isYouTubeVideo(link.url);
                        const isPlaylist = isYouTubePlaylist(link.url);
                        
                        return (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0 mt-1">
                                {isValid ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm truncate">
                                    {link.title}
                                  </span>
                                  <div className="flex gap-1">
                                    {isVideo && <Badge variant="secondary" className="text-xs">Video</Badge>}
                                    {isPlaylist && <Badge variant="secondary" className="text-xs">Playlist</Badge>}
                                    {!isValid && <Badge variant="destructive" className="text-xs">Invalid</Badge>}
                                  </div>
                                </div>
                                
                                <div className="text-xs text-muted-foreground break-all">
                                  {link.url}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Youtube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No links parsed yet. Enter some links and click "Parse Links" to see results.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Format Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Format Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Supported Format:</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm">
                    <div>Title:URL</div>
                    <div className="text-muted-foreground mt-1">
                      Example: "Javascript for beginners:https://www.youtube.com/watch?v=Hr5iLG7sUa0"
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Features:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Parses titles and URLs separated by the last colon in each line</li>
                    <li>Validates YouTube video and playlist URLs</li>
                    <li>Handles multiple lines of input</li>
                    <li>Shows validation status for each link</li>
                    <li>Supports both video and playlist URLs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
} 