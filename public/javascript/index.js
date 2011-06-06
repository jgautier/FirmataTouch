Ext.setup({
    onReady:function(){
        Ext.regModel('Ports', {
            fields: ['port']
        });
        now.analogRead=function(pin,value){
            //console.log(pin+' '+value);
        };
        now.digitalRead=function(pin,value){
            //console.log(pin+' '+value);
        };
        var portStore = new Ext.data.JsonStore({
            model: 'Ports'
        });
        var myPanel;
        var pinsPanel= new Ext.Panel({
           scroll:'vertical' 
        });
        var usbPortsPanel = new Ext.Panel({
           floating:true
           ,items: [
               new Ext.List({
                 itemTpl: '{port}'
                ,singleSelect:true
                ,store:portStore
                ,listeners:{
                    selectionchange:{
                        fn:function(selectionModel,records){
                            usbPortsPanel.hide();
                            var port=records[0].data.port;
                            now.getPins(port,function(pins){
                                for(var i = 2,length=pins.length;i<length;i++){
                                    console.log(i);
                                    console.log(pins);
                                    if(pins[i].supportedModes.length > 0){
                                        var currentControl;
                                        if(pins[i].mode==now.MODES.OUTPUT){
                                            currentControl={
                                                xtype:'togglefield'
                                               ,style:{
                                                    'background-color':'transparent'
                                                }
                                               ,listeners:{
                                                   change:{
                                                       fn:(function(index){
                                                           return function(slider,thumb,newValue,oldValue){
                                                             now.digitalWrite(index,newValue);
                                                           };
                                                       })(i)
                                                   }
                                               }
                                            };
                                        }else if(pins[i].mode==now.MODES.ANALOG){
                                            currentControl={xtype:'container',html:pins[i].value};
                                        }
                                        var pinToolbar=new Ext.Toolbar({
                                           height:75
                                           ,items:[
                                               {
                                                   xtype:'container'
                                                  ,html:'Pin '+i
                                                  ,style:{
                                                      color:'#FFFFFF'
                                                  }
                                               }
                                              ,{
                                                    xtype:'selectfield'
                                                   //,label:'Pin '+i
                                                   ,name:'modes'
                                                   ,width:200
                                                   ,value:pins[i].mode
                                                   ,options:(function(){
                                                     var pinOptions=[];
                                                     Object.keys(now.MODES).forEach(function(mode){
                                                         console.log(mode);
                                                         if(pins[i].supportedModes.indexOf(now.MODES[mode])>-1){
                                                             pinOption={text:mode,value:now.MODES[mode]};
                                                             pinOptions.push(pinOption);
                                                         }
                                                     });
                                                     return pinOptions;
                                                   })()
                                               }
                                              ,currentControl
                                            ]
                                        });
                                    }
                                    pinsPanel.add(pinToolbar);
                                }
                                pinsPanel.doLayout();
                            });
                        }
                    }
                }
               })
           ]
        });
        var myToolbar = new Ext.Toolbar({
            dock : 'top',
            title: 'FirmataTouch',
            items: [
                {
                    text: 'Choose USB Port'
                   ,handler: function(button,event){
                       now.getUSBPorts(function(ports){
                           portStore.removeAll();
                           portStore.add(ports);
                           usbPortsPanel.showBy(button.el,'fade');
                       });
                   }
                }
            ]
        });
        myPanel = new Ext.Panel({
            dockedItems: [myToolbar],
            fullscreen : true,
            layout:'fit',
            items:[pinsPanel]
        });
    }
});