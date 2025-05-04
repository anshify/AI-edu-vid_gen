"use client"
import { Input } from '@/components/ui/input'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2Icon, SparklesIcon } from 'lucide-react'
import axios from 'axios'
import { useAuthContext } from '@/app/provider'
import { toast } from 'react-hot-toast';

const suggestions=[
    "The Water Cycle",
    "Fun with Fractions", 
    "The Solar System", 
    "How Do Airplanes Fly?", 
    "Famous Landmarks Around the World", 
    "The Science Behind Rainbows", 
    "Life Cycle of a Butterfly", 
    "Why Do We Have Seasons?", 
    "The Importance of Recycling", 
    "Introduction to Coding for Kids", 
    "How Plants Grow",
];

const ageGroups = [
    { label: "Kids (5-12)", value: "Kids" },
    { label: "Teens (13-17)", value: "Teens" },
    { label: "Adults (18+)", value: "Adults" }
];

function Topic({onHandleInputChange}) {
  const [selectedTopic, setSelectedTopic] = useState();
  const [selectedScriptIndex, setSelectedScriptIndex] = useState();
  const [scripts, setScripts] = useState();
  const [loading, setLoading] = useState(false);
  const [ageGroup, setAgeGroup] = useState("Kids"); // Default age group selection
  const { user } = useAuthContext();

  const GenerateScript = async () => {
    if(user?.credits <= 0) {
        toast('Please add more credits!');
        return;
    }
    setLoading(true);
    setSelectedScriptIndex(null);
    try {
        const result = await axios.post('/api/generate-script', {
            topic: selectedTopic,
            ageGroup: ageGroup  // ✅ Send age group to API
        });
        console.log(result.data);
        setScripts(result.data?.scripts);
    } catch (e) {
        console.log(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className='mb-1'>Project Title</h2>
      <Input placeholder="Enter the concept" onChange={(event) => onHandleInputChange('title', event.target.value)} />

      <div className='mt-5'>
        <h2>Video Topic</h2>
        <p className='text-sm text-gray-600'>Select a topic for your video</p>
        <Tabs defaultValue="suggestion" className="w-full mt-2">
          <TabsList>
            <TabsTrigger value="suggestion">Suggestions</TabsTrigger>
            <TabsTrigger value="your_topic">Your Topic</TabsTrigger>
          </TabsList>
          <TabsContent value="suggestion">
            <div>
                {suggestions.map((suggestion, index) => (
                    <Button
                    variant={suggestion === selectedTopic ? "default" : "outline"}
                    key={index}
                    className={`m-1 ${suggestion === selectedTopic ? 'bg-secondary text-white' : ''}`}
                    onClick={() => {
                        setSelectedTopic(suggestion);
                        onHandleInputChange('topic', suggestion);
                    }}>
                    {suggestion}
                    </Button>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="your_topic">
            <div>
                <h2>Enter your own topic</h2>
                <Textarea placeholder="Enter your topic"
                onChange={(event) => {
                    setSelectedTopic(event.target.value);
                    onHandleInputChange('topic', event.target.value);
                }}
                />
            </div>
          </TabsContent>
        </Tabs>

        {/* 🔹 Age Group Selection */}
        <div className="mt-4">
            <h2>Select Age Group</h2>
            <select 
                className="border p-2 rounded w-full mt-2"
                value={ageGroup} 
                onChange={(e) => {
                    setAgeGroup(e.target.value);
                    onHandleInputChange('ageGroup', e.target.value);  // ✅ Send age group to parent
                }}
            >
                {ageGroups.map((group) => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                ))}
            </select>
        </div>

        {scripts?.length > 0 && (
          <div className='mt-3'>
            <h2>Select the script</h2>
            <div className='grid grid-cols-2 gap-5 mt-1'>
              {scripts?.map((item, index) => (
                <div key={index} className={`p-3 border round-lg cursor-pointer
                ${selectedScriptIndex === index && 'border-white bg-secondary'}
                `}
                onClick={() => {
                    setSelectedScriptIndex(index);
                    onHandleInputChange('script', item?.content);
                }}>
                  <h2 className='line-clamp-4 text-sm text-gray-300'>{item.content}</h2>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {!scripts && (
        <Button className="mt-3" size="sm"
        disabled={loading}
        onClick={GenerateScript}>
          {loading ? <Loader2Icon className='animate-spin' /> : <SparklesIcon />} Generate Script
        </Button>
      )}
    </div>
  )
}

export default Topic;
